import prisma from "../../client";

// Type assertion for Prisma client to include new models
const prismaWithModels = prisma as any;
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import {
  CreateWorkSessionRequest,
  UpdateWorkSessionRequest,
  CreateOvertimeTableRequest,
  UpdateOvertimeTableRequest,
  IWorkSessionWithRelations,
  IOvertimeTableWithRelations,
  WorkSessionFilters,
  OvertimeTableFilters,
  OvertimeType,
  OvertimeStatus,
  IUpdatedAttendanceService,
} from "./updatedAttendance.type";
import {
  formatTime,
  formatDate,
  formatDateTime,
  formatDuration,
  calculateDurationMinutes,
  isWithinGracePeriod,
  addGracePeriod,
  subtractGracePeriod,
  transformWorkSessionForResponse,
  getCompanyGracePeriod,
  createLocalDateTime,
  createStableDateTime,
  createLocalDateForStorage,
  normalizePunchTimesToShift,
} from "./timeUtils";

// Helper function to parse date/time strings with timezone awareness
const parseDateTime = (dateTimeStr: string | Date | any): Date => {
  // If it's already a Date object, return it
  if (dateTimeStr instanceof Date) {
    return dateTimeStr;
  }

  // If it's not a string, convert to string first
  if (typeof dateTimeStr !== "string") {
    dateTimeStr = String(dateTimeStr);
  }

  // If it's an empty string or null/undefined, use current time
  if (!dateTimeStr || dateTimeStr === "null" || dateTimeStr === "undefined") {
    return new Date();
  }

  // If it contains T or space, it's likely an ISO datetime
  if (dateTimeStr.includes("T") || dateTimeStr.includes(" ")) {
    // IMPORTANT: Treat as local time, not UTC
    const parsed = new Date(dateTimeStr);
    console.log(`parseDateTime: "${dateTimeStr}" -> Local: ${parsed.toLocaleString()} -> UTC: ${parsed.toISOString()}`);
    return parsed;
  }

  // If it's just time (HH:MM:SS), combine with today's date
  if (dateTimeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const combined = `${today}T${dateTimeStr}`;
    const parsed = new Date(combined);
    console.log(`parseDateTime time only: "${dateTimeStr}" -> "${combined}" -> Local: ${parsed.toLocaleString()} -> UTC: ${parsed.toISOString()}`);
    return parsed;
  }

  // If it's just a date (YYYY-MM-DD), combine with current time
  const date = new Date(dateTimeStr);
  const now = new Date();
  date.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
  return date;
};

// Helper function to calculate duration in minutes
const calculateDuration = (startTime: Date, endTime: Date): number => {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / (1000 * 60));
};

// Helper function to get shift information
const getShiftInfo = async (shiftId: string, date: Date) => {
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    include: {
      patternDays: {
        where: {
          dayNumber: date.getDay() === 0 ? 7 : date.getDay(), // Convert Sunday=0 to Sunday=7
        },
      },
    },
  });
  return shift;
};

// Enhanced helper function to get shift day for a specific date
const getShiftDayForDate = async (
  shiftId: string,
  date: Date,
  cycleDays?: number
) => {
  // For FIXED_WEEKLY shifts, use day of week
  // JavaScript: Sunday=0, Monday=1, ..., Saturday=6
  // Our DB: Monday=1, Tuesday=2, ..., Sunday=7
  const jsDay = date.getDay();
  const dayNumber = jsDay === 0 ? 7 : jsDay; // Convert Sunday=0 to Sunday=7
  
  console.log(`Date: ${date.toDateString()}, JS Day: ${jsDay}, DB Day Number: ${dayNumber}`);
  
  // For rotating shifts, we would calculate cycle day here if needed
  // const startOfYear = new Date(date.getFullYear(), 0, 1);
  // const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  // const cycleDay = cycleDays ? (dayOfYear % cycleDays) + 1 : dayNumber;

  const shiftDay = await prisma.shiftDay.findFirst({
    where: {
      shiftId,
      dayNumber: dayNumber,
    },
  });
  
  console.log(`Found shift day:`, shiftDay ? {
    dayNumber: shiftDay.dayNumber,
    dayType: shiftDay.dayType,
    startTime: shiftDay.startTime,
    endTime: shiftDay.endTime
  } : 'null');
  
  return shiftDay;
};

// Helper function to get rotating shift assignment
const getRotatingShiftAssignment = async (
  employeeId: string,
  date: Date,
  companyId: string
) => {
  const assignment = await prisma.employeeShiftAssignment.findFirst({
    where: {
      employeeId,
      date,
      RotatingShiftType: { isActive: true },
    },
    include: {
      RotatingShiftType: true,
    },
  });
  return assignment;
};

// Helper function to create overtime record
const createOvertimeRecord = async (
  workSessionId: string | null,
  deviceUserId: string,
  date: Date,
  punchIn: Date,
  punchOut: Date,
  type: OvertimeType,
  status: OvertimeStatus = OvertimeStatus.PENDING
): Promise<IOvertimeTableWithRelations> => {
  const duration = calculateDuration(punchIn, punchOut);
  
  console.log(`Creating overtime record: ${type}`);
  console.log(`  From: ${formatTime(punchIn)} to ${formatTime(punchOut)}`);
  console.log(`  Duration: ${duration} minutes (${formatDuration(duration)})`);
  console.log(`  Status: ${status}`);

  return await (prisma as any).overtimeTable.create({
    data: {
      workSessionId,
      deviceUserId,
      date,
      punchIn,
      punchOut,
      duration,
      type,
      status,
      punchInSource: "system",
      punchOutSource: "system",
    },
  });
};

// Helper function to check if overtime already exists
const checkExistingOvertime = async (
  deviceUserId: string,
  date: Date,
  type: OvertimeType
): Promise<boolean> => {
  const existing = await (prisma as any).overtimeTable.findFirst({
    where: {
      deviceUserId,
      date,
      type,
    },
  });
  return !!existing;
};

// Helper function to process overtime logic
const processOvertimeLogic = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  punchIn: Date,
  punchOut: Date,
  shiftId?: string
): Promise<void> => {
  if (!shiftId) {
    // No shift assigned - create UNSCHEDULED overtime
    await createOvertimeRecord(
      workSessionId,
      deviceUserId,
      date,
      punchIn,
      punchOut,
      OvertimeType.UNSCHEDULED
    );
    return;
  }

  const shift = await getShiftInfo(shiftId, date);
  if (!shift) return;

  console.log("Processing overtime with shift:", {
    shiftId: shift.id,
    shiftType: shift.shiftType,
    shiftName: shift.name
  });

  if (shift.shiftType === "FIXED_WEEKLY") {
    // Process overtime for complete work session
    await processFixedWeeklyOvertime(
      workSessionId,
      deviceUserId,
      date,
      punchIn, // Use punchIn as checkTime for analysis
      shift,
      { checkTime: punchIn },
      { checkTime: punchOut }
    );
  } else if (shift.shiftType === "ROTATING") {
    await processRotationOvertime(
      workSessionId,
      deviceUserId,
      date,
      punchIn,
      punchOut
    );
  }
};

// Enhanced process overtime for FIXED_WEEKLY shifts
const processFixedWeeklyOvertime = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  checkTime: Date,
  shiftInfo: any,
  punchInData?: any,
  punchOutData?: any
): Promise<void> => {
  console.log("=== Enhanced Fixed Weekly Overtime Processing ===");
  
  // Get employee's company ID for grace period
  const employee = await prisma.employee.findFirst({
    where: { deviceUserId },
    select: { companyId: true },
  });
  
  if (!employee) {
    console.log("Employee not found");
    return;
  }

  // Get company grace period
  const companyGracePeriodMinutes = await getCompanyGracePeriod(employee.companyId, prisma);
  console.log(`Company grace period: ${companyGracePeriodMinutes} minutes`);
  
  const shiftDay = await getShiftDayForDate(
    shiftInfo.id,
    date,
    shiftInfo.cycleDays
  );

  if (!shiftDay) {
    console.log(`No shift day found for date: ${date.toDateString()}`);
    return; // No shift day defined for this date
  }

  console.log(
    `Shift day found: Day ${shiftDay.dayNumber}, Type: ${shiftDay.dayType}`
  );
  console.log(`Shift times: ${shiftDay.startTime} - ${shiftDay.endTime}`);
  console.log(`Shift grace period: ${shiftDay.gracePeriod || 0} minutes`);

  // Check if it's a REST_DAY
  if (shiftDay.dayType === "REST_DAY") {
    console.log("REST_DAY detected - but this should have been handled separately!");
    console.log("This indicates a logic error - REST_DAY should be processed via handleRestDayOvertime");
    return;
  }

  // Parse shift times and combine with the request date
  // IMPORTANT: Use the date from the request, not from shift data
  const requestDateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  
  // Extract just the date part for shift time combination
  const dateParts = requestDateStr.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  
  const shiftStartTime = new Date(year, month, day, 0, 0, 0, 0);
  const shiftEndTime = new Date(year, month, day, 0, 0, 0, 0);
  
  // Handle both string and Date types for shift times
  const startTimeStr = shiftDay.startTime instanceof Date 
    ? shiftDay.startTime.toTimeString().split(' ')[0] 
    : shiftDay.startTime;
  const endTimeStr = shiftDay.endTime instanceof Date 
    ? shiftDay.endTime.toTimeString().split(' ')[0] 
    : shiftDay.endTime;
  
  console.log(`Shift times from DB: start=${startTimeStr}, end=${endTimeStr}`);
  
  const [startHours, startMinutes, startSeconds = 0] = startTimeStr.split(':').map(Number);
  const [endHours, endMinutes, endSeconds = 0] = endTimeStr.split(':').map(Number);
  
  shiftStartTime.setHours(startHours, startMinutes, startSeconds, 0);
  shiftEndTime.setHours(endHours, endMinutes, endSeconds, 0);
  
  console.log(`Combined DateTime: start=${shiftStartTime.toISOString()}, end=${shiftEndTime.toISOString()}`);

  console.log(`Shift start: ${formatTime(shiftStartTime)} (${shiftStartTime.toISOString()})`);
  console.log(`Shift end: ${formatTime(shiftEndTime)} (${shiftEndTime.toISOString()})`);
  console.log(`Check time: ${formatTime(checkTime)} (${checkTime.toISOString()})`);

  // Use company grace period (takes precedence over shift grace period)
  const effectiveGracePeriod = companyGracePeriodMinutes || shiftDay.gracePeriod || 0;
  console.log(`Effective grace period: ${effectiveGracePeriod} minutes`);

  // Calculate grace period boundaries
  const earlyThreshold = subtractGracePeriod(shiftStartTime, effectiveGracePeriod);
  const lateThreshold = addGracePeriod(shiftEndTime, effectiveGracePeriod);

  console.log(`Early threshold (grace boundary): ${formatTime(earlyThreshold)} - overtime if punch < this time`);
  console.log(`Late threshold (grace boundary): ${formatTime(lateThreshold)} - overtime if punch > this time`);

  // Check if punch is outside grace period boundaries
  const isEarlyOvertime = checkTime < earlyThreshold;
  const isLateOvertime = checkTime > lateThreshold;

  console.log(`Is early overtime (beyond grace): ${isEarlyOvertime}`);
  console.log(`Is late overtime (beyond grace): ${isLateOvertime}`);

  // Check for early punch-in overtime
  if (punchInData && punchInData.checkTime < earlyThreshold) {
    const actualOvertimeMinutes = calculateDurationMinutes(punchInData.checkTime, shiftStartTime);
    console.log(`Creating UNSCHEDULED overtime for early punch-in: ${actualOvertimeMinutes} minutes (from ${formatTime(punchInData.checkTime)} to ${formatTime(shiftStartTime)})`);
    
    const overtimeExists = await checkExistingOvertime(
      deviceUserId,
      date,
      OvertimeType.UNSCHEDULED
    );

    if (!overtimeExists) {
      await createOvertimeRecord(
        workSessionId,
        deviceUserId,
        date,
        punchInData.checkTime, // Original early time
        shiftStartTime, // End at actual shift start time (NOT grace boundary)
        OvertimeType.UNSCHEDULED
      );
    }
  }

  // Check for late punch-out overtime
  if (punchOutData && punchOutData.checkTime > lateThreshold) {
    const actualOvertimeMinutes = calculateDurationMinutes(shiftEndTime, punchOutData.checkTime);
    console.log(`Creating EXTENDED_SHIFT overtime for late punch-out: ${actualOvertimeMinutes} minutes (from ${formatTime(shiftEndTime)} to ${formatTime(punchOutData.checkTime)})`);
    
    const overtimeExists = await checkExistingOvertime(
      deviceUserId,
      date,
      OvertimeType.EXTENDED_SHIFT
    );

    if (!overtimeExists) {
      await createOvertimeRecord(
        workSessionId,
        deviceUserId,
        date,
        shiftEndTime, // Start at actual shift end time (NOT grace boundary)
        punchOutData.checkTime, // Original late time
        OvertimeType.EXTENDED_SHIFT
      );
    }
  }

  // Log summary
  if (punchInData && punchInData.checkTime < shiftStartTime && punchInData.checkTime >= earlyThreshold) {
    const earlyMinutes = calculateDurationMinutes(punchInData.checkTime, shiftStartTime);
    console.log(`Early punch-in within grace period: ${earlyMinutes} minutes (no overtime created)`);
  }
  
  if (punchOutData && punchOutData.checkTime > shiftEndTime && punchOutData.checkTime <= lateThreshold) {
    const lateMinutes = calculateDurationMinutes(shiftEndTime, punchOutData.checkTime);
    console.log(`Late punch-out within grace period: ${lateMinutes} minutes (no overtime created)`);
  }
  
  if (punchInData && punchInData.checkTime >= shiftStartTime && punchOutData && punchOutData.checkTime <= shiftEndTime) {
    console.log(`Work session within normal shift hours - no overtime created`);
  }

  console.log("=== End Enhanced Overtime Processing ===");
};

// Enhanced single-punch overtime processing for smart attendance
const processSinglePunchOvertime = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  checkTime: Date,
  isPunchIn: boolean,
  shiftId?: string
): Promise<void> => {
  console.log("=== Single Punch Overtime Processing ===");
  console.log(`Processing ${isPunchIn ? 'PUNCH-IN' : 'PUNCH-OUT'} at ${formatTime(checkTime)}`);
  
  if (!shiftId) {
    console.log("No shift assigned - skipping single punch overtime (will create when both punches complete)");
    return;
  }

  const shiftDay = await getShiftDayForDate(shiftId, date);
  if (!shiftDay) {
    console.log("No shift day found - skipping overtime");
    return;
  }

  console.log(`Shift day: ${shiftDay.dayType}, ${shiftDay.startTime} - ${shiftDay.endTime}`);

  // For REST_DAY, we create overtime when work session is complete, not on single punches
  if (shiftDay.dayType === "REST_DAY") {
    console.log("Single punch on REST_DAY - will create overtime when both punches complete");
    return;
  }

  // For regular working days, check if single punch is outside normal hours
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  const dateParts = dateStr.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);
  
  const shiftStartTime = new Date(year, month, day, 0, 0, 0, 0);
  const shiftEndTime = new Date(year, month, day, 0, 0, 0, 0);
  
  const startTimeStr = shiftDay.startTime instanceof Date 
    ? shiftDay.startTime.toTimeString().split(' ')[0] 
    : shiftDay.startTime;
  const endTimeStr = shiftDay.endTime instanceof Date 
    ? shiftDay.endTime.toTimeString().split(' ')[0] 
    : shiftDay.endTime;
  
  const [startHours, startMinutes, startSeconds = 0] = startTimeStr.split(':').map(Number);
  const [endHours, endMinutes, endSeconds = 0] = endTimeStr.split(':').map(Number);
  
  shiftStartTime.setHours(startHours, startMinutes, startSeconds, 0);
  shiftEndTime.setHours(endHours, endMinutes, endSeconds, 0);

  // Get company grace period
  const employee = await prisma.employee.findFirst({
    where: { deviceUserId },
    select: { companyId: true },
  });
  
  if (!employee) {
    console.log("Employee not found");
    return;
  }

  const companyGracePeriodMinutes = await getCompanyGracePeriod(employee.companyId, prisma);
  const effectiveGracePeriod = companyGracePeriodMinutes || shiftDay.gracePeriod || 0;
  
  const earlyThreshold = subtractGracePeriod(shiftStartTime, effectiveGracePeriod);
  const lateThreshold = addGracePeriod(shiftEndTime, effectiveGracePeriod);

  // Only create overtime if significantly outside shift hours
  if (isPunchIn && checkTime < earlyThreshold) {
    const actualOvertimeMinutes = calculateDurationMinutes(checkTime, shiftStartTime);
    console.log(`Early punch-in overtime: ${formatTime(checkTime)} before threshold ${formatTime(earlyThreshold)} - creating ${actualOvertimeMinutes} minutes overtime`);
    const overtimeExists = await checkExistingOvertime(deviceUserId, date, OvertimeType.UNSCHEDULED);
    if (!overtimeExists) {
      await createOvertimeRecord(
        workSessionId,
        deviceUserId,
        date,
        checkTime,
        shiftStartTime, // End at actual shift start, not grace boundary
        OvertimeType.UNSCHEDULED
      );
    }
  } else if (!isPunchIn && checkTime > lateThreshold) {
    const actualOvertimeMinutes = calculateDurationMinutes(shiftEndTime, checkTime);
    console.log(`Late punch-out overtime: ${formatTime(checkTime)} after threshold ${formatTime(lateThreshold)} - creating ${actualOvertimeMinutes} minutes overtime`);
    const overtimeExists = await checkExistingOvertime(deviceUserId, date, OvertimeType.EXTENDED_SHIFT);
    if (!overtimeExists) {
      await createOvertimeRecord(
        workSessionId,
        deviceUserId,
        date,
        shiftEndTime, // Start at actual shift end, not grace boundary
        checkTime,
        OvertimeType.EXTENDED_SHIFT
      );
    }
  } else {
    console.log(`Single punch within normal shift hours (including grace period) - no overtime created`);
  }
  
  console.log("=== End Single Punch Overtime Processing ===");
};

// Process overtime for ROTATION shifts
const processRotationOvertime = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  punchIn: Date,
  punchOut: Date
): Promise<void> => {
  // Get employee info to find company
  const employee = await prisma.employee.findFirst({
    where: { deviceUserId },
    select: { companyId: true },
  });
  if (!employee) return;

  const assignment = await getRotatingShiftAssignment(
    employee.companyId,
    date,
    employee.companyId
  );
  if (!assignment || !assignment.RotatingShiftType) return;

  const { startTime, endTime } = assignment.RotatingShiftType;

  // Parse shift times
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const shiftStartTime = new Date(date);
  shiftStartTime.setHours(startHours, startMinutes, 0, 0);

  const shiftEndTime = new Date(date);
  shiftEndTime.setHours(endHours, endMinutes, 0, 0);

  // Handle overnight shifts
  if (endHours < startHours) {
    shiftEndTime.setDate(shiftEndTime.getDate() + 1);
  }

  // Early arrival overtime
  if (punchIn < shiftStartTime) {
    await createOvertimeRecord(
      workSessionId,
      deviceUserId,
      date,
      punchIn,
      shiftStartTime,
      OvertimeType.EARLY_ARRIVAL
    );
  }

  // Late departure overtime
  if (punchOut > shiftEndTime) {
    await createOvertimeRecord(
      workSessionId,
      deviceUserId,
      date,
      shiftEndTime,
      punchOut,
      OvertimeType.LATE_DEPARTURE
    );
  }
};

// Helper function to get employee's active shift
const getEmployeeActiveShift = async (deviceUserId: string) => {
  const employee = await prisma.employee.findFirst({
    where: { deviceUserId },
    include: {
      employeeShifts: {
        where: { isActive: true },
        include: { shift: true },
        orderBy: { startDate: "desc" },
        take: 1,
      },
    },
  });

  if (!employee || !employee.employeeShifts.length) {
    return null;
  }

  return {
    employee,
    activeShift: employee.employeeShifts[0],
  };
};

// Create WorkSession (Enhanced for automatic shift detection)
const createWorkSession = async (
  data: CreateWorkSessionRequest
): Promise<IWorkSessionWithRelations> => {
  const { deviceUserId, date, punchIn, punchOut } = data;

  // Get employee and their active shift automatically
  const employeeShiftInfo = await getEmployeeActiveShift(deviceUserId);
  if (!employeeShiftInfo) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee not found or no active shift assigned"
    );
  }

  const { employee, activeShift } = employeeShiftInfo;
  const shiftId = activeShift.shiftId; // Auto-detect shift

  // Parse dates - Create local date to avoid timezone conversion
  const dateOnly = createLocalDateForStorage(date);

  const punchInTime = punchIn ? parseDateTime(punchIn) : null;
  const punchOutTime = punchOut ? parseDateTime(punchOut) : null;

  // Validate punchOut > punchIn if both exist
  if (punchInTime && punchOutTime && punchOutTime <= punchInTime) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Punch out time must be after punch in time"
    );
  }

  // Check if WorkSession already exists for this employee and date
  const existingSession = await (prisma as any).workSession.findFirst({
    where: {
      deviceUserId,
      date: dateOnly,
    },
  });

  if (existingSession) {
    // If session exists, update it with new punch data
    const updateData: any = {};

    // Handle punch-in logic
    if (punchInTime) {
      if (!existingSession.punchIn) {
        updateData.punchIn = punchInTime;
        updateData.punchInSource = data.punchInSource || "manual";
      } else {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Already punched in for this date"
        );
      }
    }

    // Handle punch-out logic
    if (punchOutTime) {
      if (!existingSession.punchOut) {
        if (!existingSession.punchIn) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Must punch in before punching out"
          );
        }
        updateData.punchOut = punchOutTime;
        updateData.punchOutSource = data.punchOutSource || "manual";
      } else {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Already punched out for this date"
        );
      }
    }

    // If no updates to make, throw error
    if (Object.keys(updateData).length === 0) {
      throw new ApiError(httpStatus.CONFLICT, "No new punch data to update");
    }

    console.log(
      "Updating existing session with data:",
      JSON.stringify(updateData, null, 2)
    );
    return await updateWorkSession(existingSession.id, updateData);
  }

  // Calculate duration and overtime
  let duration = null;
  let earlyMinutes = 0;
  let lateMinutes = 0;

  if (punchInTime && punchOutTime) {
    duration = calculateDuration(punchInTime, punchOutTime);

    // Calculate early/late minutes if shift is assigned
    if (shiftId) {
      const shift = await getShiftInfo(shiftId, dateOnly);

      console.log("dfkdfjdkjfkjdjkfkjdjk");
      console.log(shift);
      if (shift && shift.patternDays.length > 0) {
        const shiftDay = shift.patternDays[0];
        const shiftStartTime = new Date(shiftDay.startTime);
        const shiftEndTime = new Date(shiftDay.endTime);

        if (punchInTime < shiftStartTime) {
          earlyMinutes = Math.round(
            (shiftStartTime.getTime() - punchInTime.getTime()) / (1000 * 60)
          );
        }
        if (punchOutTime > shiftEndTime) {
          lateMinutes = Math.round(
            (punchOutTime.getTime() - shiftEndTime.getTime()) / (1000 * 60)
          );
        }
      }
    }
  }

  // Normalize punch times to shift schedule (show shift times instead of actual when there's overtime)
  let normalizedPunchIn = punchInTime;
  let normalizedPunchOut = punchOutTime;
  
  if (shiftId && (punchInTime || punchOutTime)) {
    const normalizationResult = await normalizePunchTimesToShift(
      punchInTime,
      punchOutTime,
      shiftId,
      dateOnly,
      prisma
    );
    normalizedPunchIn = normalizationResult.normalizedPunchIn;
    normalizedPunchOut = normalizationResult.normalizedPunchOut;
  }
  
  // Create WorkSession with normalized times
  const workSession = await (prisma as any).workSession.create({
    data: {
      deviceUserId,
      date: dateOnly,
      punchIn: normalizedPunchIn,
      punchInSource: data.punchInSource || "manual",
      punchOut: normalizedPunchOut,
      punchOutSource: data.punchOutSource || "manual",
      duration,
      shiftId,
      earlyMinutes,
      lateMinutes,
    },
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
  });

  // Process overtime using ACTUAL punch times (not normalized times)
  // Note: Work session stores normalized times, but overtime calculations use actual times
  if (punchInTime && punchOutTime) {
    console.log("Processing overtime for complete work session using actual punch times");
    await processOvertimeLogic(
      workSession.id,
      deviceUserId,
      dateOnly,
      punchInTime, // Actual punch-in time for overtime calculation
      punchOutTime, // Actual punch-out time for overtime calculation
      shiftId
    );
  } else if (punchInTime) {
    console.log("Processing single punch-in overtime using actual punch time");
    await processSinglePunchOvertime(
      workSession.id,
      deviceUserId,
      dateOnly,
      punchInTime, // Actual punch-in time for overtime calculation
      true, // isPunchIn
      shiftId
    );
  } else if (punchOutTime) {
    console.log("Processing single punch-out overtime using actual punch time");
    await processSinglePunchOvertime(
      workSession.id,
      deviceUserId,
      dateOnly,
      punchOutTime, // Actual punch-out time for overtime calculation
      false, // isPunchIn
      shiftId
    );
  }

  // Return updated WorkSession with overtime records
  const finalWorkSession = await (prisma as any).workSession.findUnique({
    where: { id: workSession.id },
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
  });

  // Transform response to include readable time formats
  return transformWorkSessionForResponse(finalWorkSession) as any;
};

// Get WorkSessions with filters
const getWorkSessions = async (
  filters: WorkSessionFilters
): Promise<IWorkSessionWithRelations[]> => {
  const where: any = {};

  if (filters.deviceUserId) {
    where.deviceUserId = filters.deviceUserId;
  }

  if (filters.date) {
    where.date = new Date(filters.date);
  }

  if (filters.shiftId) {
    where.shiftId = filters.shiftId;
  }

  if (filters.startDate && filters.endDate) {
    where.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  const workSessions = await (prisma as any).workSession.findMany({
    where,
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
    orderBy: { date: "desc" },
  });

  // Transform all work sessions to include readable time formats
  return workSessions.map(transformWorkSessionForResponse);
};

// Get WorkSession by ID
const getWorkSessionById = async (
  id: string
): Promise<IWorkSessionWithRelations> => {
  const workSession = await (prisma as any).workSession.findUnique({
    where: { id },
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
  });

  if (!workSession) {
    throw new ApiError(httpStatus.NOT_FOUND, "Work session not found");
  }

  return transformWorkSessionForResponse(workSession);
};

// Update WorkSession
const updateWorkSession = async (
  id: string,
  data: UpdateWorkSessionRequest
): Promise<IWorkSessionWithRelations> => {
  const workSession = await getWorkSessionById(id);

  const updateData: any = {};

  if (data.punchIn !== undefined) {
    updateData.punchIn = data.punchIn ? parseDateTime(data.punchIn) : null;
  }

  if (data.punchOut !== undefined) {
    updateData.punchOut = data.punchOut ? parseDateTime(data.punchOut) : null;
  }

  if (data.punchInSource !== undefined) {
    updateData.punchInSource = data.punchInSource;
  }

  if (data.punchOutSource !== undefined) {
    updateData.punchOutSource = data.punchOutSource;
  }

  if (data.shiftId !== undefined) {
    updateData.shiftId = data.shiftId;
  }

  // Recalculate duration and early/late minutes
  if (updateData.punchIn || updateData.punchOut) {
    const punchIn = updateData.punchIn || workSession.punchIn;
    const punchOut = updateData.punchOut || workSession.punchOut;

    if (punchIn && punchOut) {
      updateData.duration = calculateDuration(punchIn, punchOut);

      // Recalculate overtime if shift is assigned
      if (workSession.shiftId || data.shiftId) {
        const shiftId = data.shiftId || workSession.shiftId;
        if (shiftId) {
          const shift = await getShiftInfo(shiftId, workSession.date);
          if (shift && shift.patternDays.length > 0) {
            const shiftDay = shift.patternDays[0];
            const shiftStartTime = new Date(shiftDay.startTime);
            const shiftEndTime = new Date(shiftDay.endTime);

            updateData.earlyMinutes = 0;
            updateData.lateMinutes = 0;

            if (punchIn < shiftStartTime) {
              updateData.earlyMinutes = Math.round(
                (shiftStartTime.getTime() - punchIn.getTime()) / (1000 * 60)
              );
            }
            if (punchOut > shiftEndTime) {
              updateData.lateMinutes = Math.round(
                (punchOut.getTime() - shiftEndTime.getTime()) / (1000 * 60)
              );
            }
          }
        }
      }
    }
  }

  // Normalize punch times for display (if both punch times are being updated)
  if (updateData.punchIn || updateData.punchOut) {
    const finalPunchIn = updateData.punchIn || workSession.punchIn;
    const finalPunchOut = updateData.punchOut || workSession.punchOut;
    const finalShiftId = updateData.shiftId || workSession.shiftId;
    
    if (finalShiftId && (finalPunchIn || finalPunchOut)) {
      console.log("Normalizing updated punch times to shift schedule");
      const normalizationResult = await normalizePunchTimesToShift(
        finalPunchIn,
        finalPunchOut,
        finalShiftId,
        workSession.date,
        prisma
      );
      
      // Update with normalized times
      if (updateData.punchIn !== undefined) {
        updateData.punchIn = normalizationResult.normalizedPunchIn;
      }
      if (updateData.punchOut !== undefined) {
        updateData.punchOut = normalizationResult.normalizedPunchOut;
      }
    }
  }

  const updated = await (prisma as any).workSession.update({
    where: { id },
    data: updateData,
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
  });

  // Reprocess overtime if punch times changed
  if (updateData.punchIn || updateData.punchOut) {
    // IMPORTANT: Get the ACTUAL punch times BEFORE normalization for overtime processing
    const actualPunchIn = data.punchIn ? parseDateTime(data.punchIn) : workSession.punchIn;
    const actualPunchOut = data.punchOut ? parseDateTime(data.punchOut) : workSession.punchOut;
    
    console.log("=== Overtime Reprocessing for Update ===");
    console.log(`Actual punch-in (for overtime): ${actualPunchIn ? formatTime(actualPunchIn) : 'unchanged'}`);
    console.log(`Actual punch-out (for overtime): ${actualPunchOut ? formatTime(actualPunchOut) : 'unchanged'}`);
    
    // Use normalized times for session record, but actual times for overtime
    const punchIn = updateData.punchIn || workSession.punchIn;
    const punchOut = updateData.punchOut || workSession.punchOut;

    // Delete existing overtime records
    await (prisma as any).overtimeTable.deleteMany({
      where: { workSessionId: id },
    });

    // Recreate overtime records using ACTUAL punch times (not normalized)
    if (actualPunchIn && actualPunchOut) {
      // Both actual punch times exist - use traditional logic
      console.log("Reprocessing overtime with both actual punch times");
      await processOvertimeLogic(
        id,
        workSession.deviceUserId,
        workSession.date,
        actualPunchIn, // Use actual punch-in time for overtime
        actualPunchOut, // Use actual punch-out time for overtime
        workSession.shiftId || undefined
      );
    } else if (actualPunchIn) {
      // Only actual punch in exists - process single punch overtime
      console.log("Reprocessing overtime with actual punch-in only");
      await processSinglePunchOvertime(
        id,
        workSession.deviceUserId,
        workSession.date,
        actualPunchIn, // Use actual punch-in time for overtime
        true, // isPunchIn
        workSession.shiftId || undefined
      );
    } else if (actualPunchOut) {
      // Only actual punch out exists - process single punch overtime
      console.log("Reprocessing overtime with actual punch-out only");
      await processSinglePunchOvertime(
        id,
        workSession.deviceUserId,
        workSession.date,
        actualPunchOut, // Use actual punch-out time for overtime
        false, // isPunchIn
        workSession.shiftId || undefined
      );
    }
  }

  return await getWorkSessionById(id);
};

// Delete WorkSession
const deleteWorkSession = async (id: string): Promise<void> => {
  const workSession = await getWorkSessionById(id);

  // Delete associated overtime records first
  await (prisma as any).overtimeTable.deleteMany({
    where: { workSessionId: id },
  });

  // Delete WorkSession
  await (prisma as any).workSession.delete({
    where: { id },
  });
};

// Smart Attendance API - Handles device data and manual data
const smartAttendance = async (
  data: any
): Promise<IWorkSessionWithRelations> => {
  try {
    console.log("Smart attendance input data:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.deviceUserId || !data.date) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "deviceUserId and date are required"
      );
    }

    // Handle different input formats
    let processedData: any = {};

    // Format 1: Device data (ZKTeco format)
    if (data.checkTime && !data.punchIn && !data.punchOut) {
      const { deviceUserId, date, checkTime, deviceIp } = data;

      // Normalize date to midnight for consistent comparison - Create local date
      const dateOnly = createLocalDateForStorage(date);

      // Auto-detect if this should be punch-in or punch-out
      const existingSession = await (prisma as any).workSession.findFirst({
        where: {
          deviceUserId,
          date: dateOnly,
        },
      });

      console.log("Existing session check:", {
        deviceUserId,
        dateOnly: dateOnly.toISOString(),
        existingSession: existingSession
          ? {
              id: existingSession.id,
              punchIn: existingSession.punchIn,
              punchOut: existingSession.punchOut,
            }
          : null,
      });

      if (!existingSession || !existingSession.punchIn) {
        // No session or no punch-in yet = PUNCH IN
        const checkTimeStr = String(checkTime);
        
        // Create stable datetime to avoid timezone conversion issues
        const localDateTime = createStableDateTime(date, checkTimeStr);
        
        console.log(`PUNCH-IN: date=${date}, checkTime=${checkTimeStr}`);
        console.log(`PUNCH-IN Local DateTime: ${localDateTime.toLocaleString()}`);
        console.log(`PUNCH-IN UTC DateTime: ${localDateTime.toISOString()}`);
        
        processedData = {
          deviceUserId,
          date,
          punchIn: localDateTime.toISOString(), // Store as ISO string for database
          punchInSource: deviceIp ? "device" : "manual",
          punchOutSource: "manual",
        };
      } else if (!existingSession.punchOut) {
        // Session exists with punch-in but no punch-out = PUNCH OUT
        const checkTimeStr = String(checkTime);
        
        // Create stable datetime to avoid timezone conversion issues
        const localDateTime = createStableDateTime(date, checkTimeStr);
        
        console.log(`PUNCH-OUT: date=${date}, checkTime=${checkTimeStr}`);
        console.log(`PUNCH-OUT Local DateTime: ${localDateTime.toLocaleString()}`);
        console.log(`PUNCH-OUT UTC DateTime: ${localDateTime.toISOString()}`);
        
        processedData = {
          deviceUserId,
          date,
          punchOut: localDateTime.toISOString(), // Store as ISO string for database
          punchOutSource: deviceIp ? "device" : "manual",
          punchInSource: "manual",
        };
      } else {
        throw new ApiError(
          httpStatus.CONFLICT,
          "Employee has already completed attendance for this date"
        );
      }
    }
    // Format 2: Manual data (explicit punch in/out)
    else {
      processedData = { ...data };

      // Set default sources if not provided
      if (data.punchIn && !data.punchInSource) {
        processedData.punchInSource = data.deviceIp ? "device" : "manual";
      }
      if (data.punchOut && !data.punchOutSource) {
        processedData.punchOutSource = data.deviceIp ? "device" : "manual";
      }
    }

    console.log(
      "Processed data before processing:",
      JSON.stringify(processedData, null, 2)
    );
    
    // Check if this is a REST_DAY or HOLIDAY before creating work session
    const employee = await prisma.employee.findFirst({
      where: { deviceUserId: processedData.deviceUserId },
      include: {
        employeeShifts: {
          where: { isActive: true },
          include: { shift: true },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    });
    
    if (employee && employee.employeeShifts.length > 0) {
      const shiftId = employee.employeeShifts[0].shiftId;
      const requestDate = createLocalDateForStorage(processedData.date);
      
      // Check for holiday first
      const holiday = await prisma.workingCalendar.findFirst({
        where: {
          // companyId: employee.companyId,
          date: requestDate,
          dayType: "HOLIDAY",
          isActive: true,
        },
      });
      
      if (holiday) {
        console.log("HOLIDAY detected - handling overtime-only processing");
        console.log(`Holiday: ${holiday.description || 'Unnamed Holiday'} on ${formatDate(holiday.date)}`);
        return await handleHolidayOvertime(processedData, employee.id);
      }
      
      // Check for REST_DAY
      const shiftDay = await getShiftDayForDate(shiftId, requestDate);
      
      if (shiftDay && shiftDay.dayType === "REST_DAY") {
        console.log("REST_DAY detected - handling overtime-only processing");
        return await handleRestDayOvertime(processedData, employee.id);
      }
    }
    
    // Regular work day - create work session as normal
    return await createWorkSession(processedData);
  } catch (error) {
    console.error("Error in smartAttendance:", error);
    throw error;
  }
};

// Handle HOLIDAY overtime-only processing (no work session creation)
const handleHolidayOvertime = async (data: any, employeeId: string): Promise<any> => {
  const { deviceUserId, date, punchIn, punchOut } = data;
  
  console.log("=== HOLIDAY Overtime-Only Processing ===");
  console.log("Input data:", { deviceUserId, date, punchIn: !!punchIn, punchOut: !!punchOut });
  
  // Create normalized date for database queries
  const dateOnly = createLocalDateForStorage(date);
  
  // Check if there's an existing overtime record for this date
  const existingOvertime = await (prisma as any).overtimeTable.findFirst({
    where: {
      deviceUserId,
      date: dateOnly,
      type: OvertimeType.HOLIDAY_WORK,
    },
  });
  
  console.log("Existing HOLIDAY overtime:", existingOvertime ? {
    id: existingOvertime.id,
    punchIn: formatTime(existingOvertime.punchIn),
    punchOut: existingOvertime.punchOut ? formatTime(existingOvertime.punchOut) : null,
    duration: existingOvertime.duration
  } : 'none');
  
  if (!existingOvertime) {
    // No existing overtime - this is the first punch (should be punch in)
    if (!punchIn) {
      throw new ApiError(httpStatus.BAD_REQUEST, "First punch should be punch-in for HOLIDAY work");
    }
    
    const punchInTime = parseDateTime(punchIn);
    console.log(`Creating HOLIDAY overtime with punch-in: ${formatTime(punchInTime)}`);
    
    const overtime = await (prisma as any).overtimeTable.create({
      data: {
        workSessionId: null, // No work session for HOLIDAY
        deviceUserId,
        date: dateOnly,
        punchIn: punchInTime,
        punchOut: null, // Will be updated on second punch
        duration: null, // Will be calculated on second punch
        type: OvertimeType.HOLIDAY_WORK,
        status: OvertimeStatus.PENDING,
        punchInSource: data.punchInSource || "manual",
        punchOutSource: data.punchOutSource || "manual",
      },
    });
    
    return transformHolidayOvertimeForResponse(overtime);
    
  } else if (!existingOvertime.punchOut) {
    // Existing overtime with punch-in but no punch-out - this is the second punch (should be punch out)
    
    // The second call will have punchOut in the data
    const punchOutValue = punchOut || punchIn; // Sometimes it might be in punchIn field
    
    if (!punchOutValue) {
      console.log("No punch out value found in data:", data);
      throw new ApiError(httpStatus.BAD_REQUEST, "Punch out time is required to complete HOLIDAY work");
    }
    
    const punchOutTime = parseDateTime(punchOutValue);
    const duration = calculateDuration(existingOvertime.punchIn, punchOutTime);
    
    console.log(`Updating HOLIDAY overtime with punch-out: ${formatTime(punchOutTime)}`);
    console.log(`Total duration: ${duration} minutes (${formatDuration(duration)})`);
    
    const updatedOvertime = await (prisma as any).overtimeTable.update({
      where: { id: existingOvertime.id },
      data: {
        punchOut: punchOutTime,
        duration,
        punchOutSource: data.punchOutSource || "manual",
      },
    });
    
    return transformHolidayOvertimeForResponse(updatedOvertime);
    
  } else {
    // Already completed HOLIDAY work
    throw new ApiError(httpStatus.CONFLICT, "HOLIDAY work already completed for this date");
  }
};

// Transform HOLIDAY overtime response to match work session format
const transformHolidayOvertimeForResponse = (overtime: any) => {
  return {
    id: overtime.id,
    deviceUserId: overtime.deviceUserId,
    date: overtime.date,
    punchIn: overtime.punchIn,
    punchOut: overtime.punchOut,
    duration: overtime.duration,
    shiftId: null, // No shift for HOLIDAY
    earlyMinutes: 0,
    lateMinutes: 0,
    createdAt: overtime.createdAt,
    updatedAt: overtime.updatedAt,
    punchInSource: overtime.punchInSource,
    punchOutSource: overtime.punchOutSource,
    shift: null, // No shift for HOLIDAY
    OvertimeTable: [
      {
        ...overtime,
        punchInTime: formatTime(overtime.punchIn),
        punchOutTime: formatTime(overtime.punchOut),
        durationFormatted: overtime.duration ? formatDuration(overtime.duration) : null,
      }
    ],
    punchInTime: formatTime(overtime.punchIn),
    punchOutTime: formatTime(overtime.punchOut),
    dateFormatted: formatDate(overtime.date),
    durationFormatted: overtime.duration ? formatDuration(overtime.duration) : null,
  };
};

// Handle REST_DAY overtime-only processing (no work session creation)
const handleRestDayOvertime = async (data: any, employeeId: string): Promise<any> => {
  const { deviceUserId, date, punchIn, punchOut } = data;
  
  console.log("=== REST_DAY Overtime-Only Processing ===");
  console.log("Input data:", { deviceUserId, date, punchIn: !!punchIn, punchOut: !!punchOut });
  
  // Create normalized date for database queries
  const dateOnly = createLocalDateForStorage(date);
  
  // Check if there's an existing overtime record for this date
  const existingOvertime = await (prisma as any).overtimeTable.findFirst({
    where: {
      deviceUserId,
      date: dateOnly,
      type: OvertimeType.REST_DAY_WORK,
    },
  });
  
  console.log("Existing REST_DAY overtime:", existingOvertime ? {
    id: existingOvertime.id,
    punchIn: formatTime(existingOvertime.punchIn),
    punchOut: existingOvertime.punchOut ? formatTime(existingOvertime.punchOut) : null,
    duration: existingOvertime.duration
  } : 'none');
  
  if (!existingOvertime) {
    // No existing overtime - this is the first punch (should be punch in)
    if (!punchIn) {
      throw new ApiError(httpStatus.BAD_REQUEST, "First punch should be punch-in for REST_DAY work");
    }
    
    const punchInTime = parseDateTime(punchIn);
    console.log(`Creating REST_DAY overtime with punch-in: ${formatTime(punchInTime)}`);
    
    const overtime = await (prisma as any).overtimeTable.create({
      data: {
        workSessionId: null, // No work session for REST_DAY
        deviceUserId,
        date: dateOnly,
        punchIn: punchInTime,
        punchOut: null, // Will be updated on second punch
        duration: null, // Will be calculated on second punch
        type: OvertimeType.REST_DAY_WORK,
        status: OvertimeStatus.PENDING,
        punchInSource: data.punchInSource || "manual",
        punchOutSource: data.punchOutSource || "manual",
      },
    });
    
    return transformRestDayOvertimeForResponse(overtime);
    
  } else if (!existingOvertime.punchOut) {
    // Existing overtime with punch-in but no punch-out - this is the second punch (should be punch out)
    
    // The second call will have punchOut in the data
    const punchOutValue = punchOut || punchIn; // Sometimes it might be in punchIn field
    
    if (!punchOutValue) {
      console.log("No punch out value found in data:", data);
      throw new ApiError(httpStatus.BAD_REQUEST, "Punch out time is required to complete REST_DAY work");
    }
    
    const punchOutTime = parseDateTime(punchOutValue);
    const duration = calculateDuration(existingOvertime.punchIn, punchOutTime);
    
    console.log(`Updating REST_DAY overtime with punch-out: ${formatTime(punchOutTime)}`);
    console.log(`Total duration: ${duration} minutes (${formatDuration(duration)})`);
    
    const updatedOvertime = await (prisma as any).overtimeTable.update({
      where: { id: existingOvertime.id },
      data: {
        punchOut: punchOutTime,
        duration,
        punchOutSource: data.punchOutSource || "manual",
      },
    });
    
    return transformRestDayOvertimeForResponse(updatedOvertime);
    
  } else {
    // Already completed REST_DAY work
    throw new ApiError(httpStatus.CONFLICT, "REST_DAY work already completed for this date");
  }
};

// Transform REST_DAY overtime response to match work session format
const transformRestDayOvertimeForResponse = (overtime: any) => {
  return {
    id: overtime.id,
    deviceUserId: overtime.deviceUserId,
    date: overtime.date,
    punchIn: overtime.punchIn,
    punchOut: overtime.punchOut,
    duration: overtime.duration,
    shiftId: null, // No shift for REST_DAY
    earlyMinutes: 0,
    lateMinutes: 0,
    createdAt: overtime.createdAt,
    updatedAt: overtime.updatedAt,
    punchInSource: overtime.punchInSource,
    punchOutSource: overtime.punchOutSource,
    shift: null, // No shift for REST_DAY
    OvertimeTable: [
      {
        ...overtime,
        punchInTime: formatTime(overtime.punchIn),
        punchOutTime: formatTime(overtime.punchOut),
        durationFormatted: overtime.duration ? formatDuration(overtime.duration) : null,
      }
    ],
    punchInTime: formatTime(overtime.punchIn),
    punchOutTime: formatTime(overtime.punchOut),
    dateFormatted: formatDate(overtime.date),
    durationFormatted: overtime.duration ? formatDuration(overtime.duration) : null,
  };
};

// Legacy Punch In (for backward compatibility)
const punchIn = async (
  deviceUserId: string,
  date: string,
  punchTime?: string,
  source: string = "manual"
): Promise<IWorkSessionWithRelations> => {
  return await smartAttendance({
    deviceUserId,
    date,
    punchIn: punchTime || new Date().toISOString(),
    punchInSource: source,
  });
};

// Legacy Punch Out (for backward compatibility)
const punchOut = async (
  deviceUserId: string,
  date: string,
  punchTime?: string,
  source: string = "manual"
): Promise<IWorkSessionWithRelations> => {
  return await smartAttendance({
    deviceUserId,
    date,
    punchOut: punchTime || new Date().toISOString(),
    punchOutSource: source,
  });
};

// Create OvertimeTable
const createOvertimeTable = async (
  data: CreateOvertimeTableRequest
): Promise<IOvertimeTableWithRelations> => {
  const { deviceUserId, date, punchIn, punchOut, type, workSessionId } = data;

  // Validate deviceUserId exists
  const employee = await prisma.employee.findFirst({
    where: { deviceUserId },
    select: { id: true },
  });
  if (!employee) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Employee not found");
  }

  // Parse dates - Create local date to avoid timezone conversion
  const dateOnly = createLocalDateForStorage(date);

  const punchInTime = parseDateTime(punchIn);
  const punchOutTime = parseDateTime(punchOut);

  // Validate punchOut > punchIn
  if (punchOutTime <= punchInTime) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Punch out time must be after punch in time"
    );
  }

  // Check if overtime already exists
  const existingOvertime = await checkExistingOvertime(
    deviceUserId,
    dateOnly,
    type
  );
  if (existingOvertime) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Overtime record already exists for this type and date"
    );
  }

  const overtime = await (prisma as any).overtimeTable.create({
    data: {
      workSessionId,
      deviceUserId,
      date: dateOnly,
      punchIn: punchInTime,
      punchOut: punchOutTime,
      duration: calculateDuration(punchInTime, punchOutTime),
      type,
      status: OvertimeStatus.PENDING,
      punchInSource: data.punchInSource || "manual",
      punchOutSource: data.punchOutSource || "manual",
    },
    include: {
      workSession: true,
    },
  });

  return overtime;
};

// Get OvertimeTables with filters
const getOvertimeTables = async (
  filters: OvertimeTableFilters
): Promise<IOvertimeTableWithRelations[]> => {
  const where: any = {};

  if (filters.deviceUserId) {
    where.deviceUserId = filters.deviceUserId;
  }

  if (filters.date) {
    where.date = new Date(filters.date);
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate && filters.endDate) {
    where.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  }

  return await (prisma as any).overtimeTable.findMany({
    where,
    include: {
      workSession: true,
    },
    orderBy: { date: "desc" },
  });
};

// Get OvertimeTable by ID
const getOvertimeTableById = async (
  id: string
): Promise<IOvertimeTableWithRelations> => {
  const overtime = await (prisma as any).overtimeTable.findUnique({
    where: { id },
    include: {
      workSession: true,
    },
  });

  if (!overtime) {
    throw new ApiError(httpStatus.NOT_FOUND, "Overtime record not found");
  }

  return overtime;
};

// Update OvertimeTable
const updateOvertimeTable = async (
  id: string,
  data: UpdateOvertimeTableRequest
): Promise<IOvertimeTableWithRelations> => {
  const overtime = await getOvertimeTableById(id);

  const updateData: any = {};

  if (data.punchIn !== undefined) {
    updateData.punchIn = parseDateTime(data.punchIn);
  }

  if (data.punchOut !== undefined) {
    updateData.punchOut = parseDateTime(data.punchOut);
  }

  if (data.punchInSource !== undefined) {
    updateData.punchInSource = data.punchInSource;
  }

  if (data.punchOutSource !== undefined) {
    updateData.punchOutSource = data.punchOutSource;
  }

  if (data.type !== undefined) {
    updateData.type = data.type;
  }

  if (data.workSessionId !== undefined) {
    updateData.workSessionId = data.workSessionId;
  }

  // Recalculate duration if punch times changed
  if (updateData.punchIn || updateData.punchOut) {
    const punchIn = updateData.punchIn || overtime.punchIn;
    const punchOut = updateData.punchOut || overtime.punchOut;
    updateData.duration = calculateDuration(punchIn, punchOut);
  }

  const updated = await (prisma as any).overtimeTable.update({
    where: { id },
    data: updateData,
    include: {
      workSession: true,
    },
  });

  return updated;
};

// Delete OvertimeTable
const deleteOvertimeTable = async (id: string): Promise<void> => {
  const overtime = await getOvertimeTableById(id);

  await (prisma as any).overtimeTable.delete({
    where: { id },
  });
};

// Update Overtime Status
const updateOvertimeStatus = async (
  id: string,
  status: OvertimeStatus
): Promise<IOvertimeTableWithRelations> => {
  const overtime = await getOvertimeTableById(id);

  const updated = await (prisma as any).overtimeTable.update({
    where: { id },
    data: { status },
    include: {
      workSession: true,
    },
  });

  return updated;
};

// Service object
const updatedAttendanceService: IUpdatedAttendanceService = {
  createWorkSession,
  getWorkSessions,
  getWorkSessionById,
  updateWorkSession,
  deleteWorkSession,
  smartAttendance,
  punchIn,
  punchOut,
  createOvertimeTable,
  getOvertimeTables,
  getOvertimeTableById,
  updateOvertimeTable,
  deleteOvertimeTable,
  updateOvertimeStatus,
};

export default updatedAttendanceService;
