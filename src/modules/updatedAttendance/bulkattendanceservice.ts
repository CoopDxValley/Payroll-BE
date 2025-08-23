import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import { IWorkSessionWithRelations, OvertimeType, OvertimeStatus } from "./updatedAttendance.type";
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

// Type assertion for Prisma client to include new models
const prismaWithModels = prisma as any;

// Interface for bulk attendance request
interface BulkAttendanceRequest {
  attendanceRecords: Array<{
    deviceUserId: string;
    date: string;
    checkTime?: string;
    punchIn?: string;
    punchOut?: string;
    punchInSource?: string;
    punchOutSource?: string;
    deviceIp?: string;
  }>;
}

// Interface for bulk attendance response
interface BulkAttendanceResponse {
  success: boolean;
  totalRecords: number;
  successfulRecords: number;
  failedRecords: number;
  results: Array<{
    index: number;
    success: boolean;
    data?: IWorkSessionWithRelations;
    error?: string;
    deviceUserId?: string;
    date?: string;
  }>;
}

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
    console.log(
      `parseDateTime: "${dateTimeStr}" -> Local: ${parsed.toLocaleString()} -> UTC: ${parsed.toISOString()}`
    );
    return parsed;
  }

  // If it's just time (HH:MM:SS), combine with today's date
  if (dateTimeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const combined = `${today}T${dateTimeStr}`;
    const parsed = new Date(combined);
    console.log(
      `parseDateTime time only: "${dateTimeStr}" -> "${combined}" -> Local: ${parsed.toLocaleString()} -> UTC: ${parsed.toISOString()}`
    );
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

  if (
    !employee ||
    !employee.employeeShifts ||
    !employee.employeeShifts.length
  ) {
    return null;
  }

  return {
    employee,
    activeShift: employee.employeeShifts[0],
  };
};

// Helper function to get shift day for a specific date
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

  console.log(
    `Date: ${date.toDateString()}, JS Day: ${jsDay}, DB Day Number: ${dayNumber}`
  );

  const shiftDay = await prisma.shiftDay.findFirst({
    where: {
      shiftId,
      dayNumber: dayNumber,
    },
  });

  console.log(
    `Found shift day:`,
    shiftDay
      ? {
          dayNumber: shiftDay.dayNumber,
          dayType: shiftDay.dayType,
          startTime: shiftDay.startTime,
          endTime: shiftDay.endTime,
        }
      : "null"
  );

  return shiftDay;
};

// Helper function to get rotating shift assignment
const getRotatingShiftAssignment = async (employeeId: string, date: Date) => {
  console.log(
    `Looking for rotation assignment: employeeId=${employeeId}, date=${date.toDateString()}`
  );

  const assignment = await prisma.employeeShiftAssignment.findFirst({
    where: {
      employeeId,
      date: createLocalDateForStorage(date.toISOString().split("T")[0]),
    },
    include: {
      RotatingShiftType: true,
      employee: {
        select: {
          name: true,
          username: true,
        },
      },
      schedule: {
        select: {
          name: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });

  console.log(
    "Rotation assignment found:",
    assignment
      ? {
          id: assignment.id,
          date: assignment.date,
          hours: assignment.hours,
          shiftType: assignment.RotatingShiftType?.name,
          startTime: assignment.RotatingShiftType?.startTime,
          endTime: assignment.RotatingShiftType?.endTime,
        }
      : "No assignment found"
  );

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
): Promise<any> => {
  const duration = calculateDuration(punchIn, punchOut);

  console.log(`Creating overtime record: ${type}`);
  console.log(`  From: ${formatTime(punchIn)} to ${formatTime(punchOut)}`);
  console.log(`  Duration: ${duration} minutes (${formatDuration(duration)})`);
  console.log(`  Status: ${status}`);

  return await prismaWithModels.overtimeTable.create({
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

// Process overtime for FIXED_WEEKLY shifts with grace period
const processFixedWeeklyOvertime = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  punchInTime: Date | null,
  punchOutTime: Date | null,
  shiftId: string
): Promise<void> => {
  console.log("=== Processing FIXED_WEEKLY Overtime ===");

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
  const companyGracePeriodMinutes = await getCompanyGracePeriod(
    employee.companyId,
    prisma
  );
  console.log(`Company grace period: ${companyGracePeriodMinutes} minutes`);

  const shiftDay = await getShiftDayForDate(shiftId, date);

  if (!shiftDay) {
    console.log(`No shift day found for date: ${date.toDateString()}`);
    return;
  }

  console.log(`Shift day: ${shiftDay.dayType}, ${shiftDay.startTime} - ${shiftDay.endTime}`);

  // Check if it's a REST_DAY or HOLIDAY
  if (shiftDay.dayType === "REST_DAY") {
    console.log("REST_DAY detected - creating REST_DAY overtime");
    if (punchInTime && punchOutTime) {
      await createOvertimeRecord(
        workSessionId,
        deviceUserId,
        date,
        punchInTime,
        punchOutTime,
        OvertimeType.REST_DAY_WORK
      );
    }
    return;
  }

  // Parse shift times and combine with the request date
  const requestDateStr = date.toISOString().split("T")[0];
  const dateParts = requestDateStr.split("-");
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1;
  const day = parseInt(dateParts[2], 10);

  const shiftStartTime = new Date(year, month, day, 0, 0, 0, 0);
  const shiftEndTime = new Date(year, month, day, 0, 0, 0, 0);

  // Handle both string and Date types for shift times
  const startTimeStr =
    shiftDay.startTime instanceof Date
      ? shiftDay.startTime.toTimeString().split(" ")[0]
      : shiftDay.startTime;
  const endTimeStr =
    shiftDay.endTime instanceof Date
      ? shiftDay.endTime.toTimeString().split(" ")[0]
      : shiftDay.endTime;

  const [startHours, startMinutes, startSeconds = 0] = startTimeStr
    .split(":")
    .map(Number);
  const [endHours, endMinutes, endSeconds = 0] = endTimeStr
    .split(":")
    .map(Number);

  shiftStartTime.setHours(startHours, startMinutes, startSeconds, 0);
  shiftEndTime.setHours(endHours, endMinutes, endSeconds, 0);

  // Use company grace period
  const effectiveGracePeriod = companyGracePeriodMinutes || 0;
  console.log(`Effective grace period: ${effectiveGracePeriod} minutes`);

  // Calculate grace period boundaries
  const earlyThreshold = subtractGracePeriod(
    shiftStartTime,
    effectiveGracePeriod
  );
  const lateThreshold = addGracePeriod(shiftEndTime, effectiveGracePeriod);

  console.log(`Early threshold: ${formatTime(earlyThreshold)}`);
  console.log(`Late threshold: ${formatTime(lateThreshold)}`);

  // Check for early arrival overtime
  if (punchInTime && punchInTime < earlyThreshold) {
    console.log("Creating early arrival overtime");
    await createOvertimeRecord(
      workSessionId,
      deviceUserId,
      date,
      punchInTime,
      shiftStartTime,
      OvertimeType.UNSCHEDULED
    );
  }

  // Check for late departure overtime
  if (punchOutTime && punchOutTime > lateThreshold) {
    console.log("Creating late departure overtime");
    await createOvertimeRecord(
      workSessionId,
      deviceUserId,
      date,
      shiftEndTime,
      punchOutTime,
      OvertimeType.EXTENDED_SHIFT
    );
  }
};

// Process overtime for ROTATION shifts with grace period
const processRotationOvertime = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  punchInTime: Date | null,
  punchOutTime: Date | null,
  assignment: any
): Promise<void> => {
  console.log("=== Processing ROTATION Overtime ===");

  if (!assignment || !assignment.RotatingShiftType) {
    console.log("No rotation assignment found");
    return;
  }

  const { startTime, endTime } = assignment.RotatingShiftType;

  // Validate shift times
  if (!startTime || typeof startTime !== 'string') {
    console.log(`Invalid startTime in rotation assignment: ${startTime}`);
    return;
  }
  if (!endTime || typeof endTime !== 'string') {
    console.log(`Invalid endTime in rotation assignment: ${endTime}`);
    return;
  }

  // Parse shift times
  const dateStr = date.toISOString().split("T")[0];
  const shiftStartTime = createStableDateTime(dateStr, startTime);
  let shiftEndTime = createStableDateTime(dateStr, endTime);

  // Handle overnight shifts
  if (endTime < startTime) {
    shiftEndTime.setDate(shiftEndTime.getDate() + 1);
  }

  // Get employee info for grace period
  const employee = await prisma.employee.findFirst({
    where: { deviceUserId },
    select: { companyId: true },
  });

  if (!employee) {
    console.log("Employee not found for rotation overtime");
    return;
  }

  // Get company grace period
  const companyGracePeriodMinutes = await getCompanyGracePeriod(
    employee.companyId,
    prisma
  );
  const effectiveGracePeriod = companyGracePeriodMinutes || 0;

  const earlyThreshold = subtractGracePeriod(
    shiftStartTime,
    effectiveGracePeriod
  );
  const lateThreshold = addGracePeriod(shiftEndTime, effectiveGracePeriod);

  console.log(`Rotation overtime with grace period: ${effectiveGracePeriod} minutes`);
  console.log(`Early threshold: ${formatTime(earlyThreshold)}, Late threshold: ${formatTime(lateThreshold)}`);

  // Early arrival overtime (only if beyond grace period)
  if (punchInTime && punchInTime < earlyThreshold) {
    console.log("Creating early arrival overtime for rotation");
    await createOvertimeRecord(
      workSessionId,
      deviceUserId,
      date,
      punchInTime,
      shiftStartTime,
      OvertimeType.UNSCHEDULED
    );
  }

  // Late departure overtime (only if beyond grace period)
  if (punchOutTime && punchOutTime > lateThreshold) {
    console.log("Creating late departure overtime for rotation");
    await createOvertimeRecord(
      workSessionId,
      deviceUserId,
      date,
      shiftEndTime,
      punchOutTime,
      OvertimeType.EXTENDED_SHIFT
    );
  }
};

// Process individual attendance record
const processSingleAttendanceRecord = async (record: any): Promise<IWorkSessionWithRelations> => {
  console.log(`=== Processing Single Attendance Record ===`);
  console.log(`DeviceUserId: ${record.deviceUserId}, Date: ${record.date}`);

  const { deviceUserId, date, checkTime, punchIn, punchOut, deviceIp } = record;

  // Get employee and their active shift automatically
  const employeeShiftInfo = await getEmployeeActiveShift(deviceUserId);
  if (!employeeShiftInfo) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee not found or no active shift assigned"
    );
  }

  const { employee, activeShift } = employeeShiftInfo;
  const shiftId = activeShift.shiftId;

  // Parse date - Create local date to avoid timezone conversion
  const dateOnly = createLocalDateForStorage(date);

  // Handle different input formats
  let processedData: any = {};

  // Format 1: Device data (ZKTeco format)
  if (checkTime && !punchIn && !punchOut) {
    // Auto-detect if this should be punch-in or punch-out
    const existingSession = await prismaWithModels.workSession.findFirst({
      where: {
        deviceUserId,
        date: dateOnly,
      },
    });

    if (!existingSession || !existingSession.punchIn) {
      // No session or no punch-in yet = PUNCH IN
      const localDateTime = createStableDateTime(date, checkTime);
      
      processedData = {
        deviceUserId,
        date,
        punchIn: localDateTime.toISOString(),
        punchInSource: deviceIp ? "device" : "manual",
        punchOutSource: "manual",
      };
    } else if (!existingSession.punchOut) {
      // Session exists with punch-in but no punch-out = PUNCH OUT
      const localDateTime = createStableDateTime(date, checkTime);
      
      // Update existing session
      const punchInTime = existingSession.punchIn;
      const punchOutTime = localDateTime;
      
      // Calculate duration
      const duration = calculateDuration(punchInTime, punchOutTime);

      // Normalize punch times to shift schedule
      let normalizedPunchIn: Date | null = punchInTime;
      let normalizedPunchOut: Date | null = punchOutTime;

      if (shiftId) {
        const normalizationResult = await normalizePunchTimesToShift(
          punchInTime,
          punchOutTime,
          shiftId,
          dateOnly,
          prisma
        );
        normalizedPunchIn = normalizationResult.normalizedPunchIn || punchInTime;
        normalizedPunchOut = normalizationResult.normalizedPunchOut || punchOutTime;
      }

      // Calculate deducted minutes for session update (break time + attendance penalties for FIXED_WEEKLY shifts)
      let dedutedMinutes = 0;
      if (shiftId && normalizedPunchIn && normalizedPunchOut) {
        // Get shift day info for deductible calculations
        const dateObj = new Date(dateOnly);
        const jsDay = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNumber = jsDay === 0 ? 7 : jsDay; // Convert to 1-7 format (1 = Monday, 7 = Sunday)
        
        const shiftDay = await prisma.shiftDay.findFirst({
          where: {
            shiftId,
            dayNumber: dayNumber,
          },
        });
        
        if (shiftDay) {
          // Start with break time
          dedutedMinutes = shiftDay.breakTime || 0;
          
          // For FIXED_WEEKLY shifts, add attendance penalties (late arrival + early departure)
          if (activeShift.shift.shiftType === "FIXED_WEEKLY" && punchInTime && punchOutTime) {
            const gracePeriodMinutes = shiftDay.gracePeriod || 0;
            
            // Extract time strings from shift DateTime objects and create them on the work date
            const shiftStartTimeStr = formatTime(new Date(shiftDay.startTime));
            const shiftEndTimeStr = formatTime(new Date(shiftDay.endTime));
            
            if (shiftStartTimeStr && shiftEndTimeStr) {
              const workDateStr = date; // Use the work date string (YYYY-MM-DD format)
              const shiftStartTime = createStableDateTime(workDateStr, shiftStartTimeStr);
              const shiftEndTime = createStableDateTime(workDateStr, shiftEndTimeStr);
              
              // Calculate late arrival penalty (beyond grace period)
              if (punchInTime > shiftStartTime) {
                const lateArrivalMinutes = Math.round(
                  (punchInTime.getTime() - shiftStartTime.getTime()) / (1000 * 60)
                );
                // Only count as deductible if beyond grace period
                if (lateArrivalMinutes > gracePeriodMinutes) {
                  dedutedMinutes += lateArrivalMinutes - gracePeriodMinutes;
                }
              }
              
              // Calculate early departure penalty (beyond grace period)
              if (punchOutTime < shiftEndTime) {
                const earlyDepartureMinutes = Math.round(
                  (shiftEndTime.getTime() - punchOutTime.getTime()) / (1000 * 60)
                );
                // Only count as deductible if beyond grace period
                if (earlyDepartureMinutes > gracePeriodMinutes) {
                  dedutedMinutes += earlyDepartureMinutes - gracePeriodMinutes;
                }
              }
              
              console.log("=== Bulk Update Deductible Minutes Calculation (FIXED_WEEKLY) ===");
              console.log("Break time:", shiftDay.breakTime || 0);
              console.log("Grace period:", gracePeriodMinutes);
              console.log("Shift start:", formatTime(shiftStartTime));
              console.log("Shift end:", formatTime(shiftEndTime));
              console.log("Actual punch in:", formatTime(punchInTime));
              console.log("Actual punch out:", formatTime(punchOutTime));
              console.log("Total deductible minutes:", dedutedMinutes);
            }
          }
        }
      }

      // Update the work session
      const updatedSession = await prismaWithModels.workSession.update({
        where: { id: existingSession.id },
        data: {
          punchOut: normalizedPunchOut,
          punchOutSource: deviceIp ? "device" : "manual",
          duration: (normalizedPunchIn && normalizedPunchOut) ? calculateDuration(normalizedPunchIn as Date, normalizedPunchOut as Date) : null,
          dedutedMinutes,
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

      // Process overtime using ACTUAL punch times (not normalized)
      if (activeShift.shift.shiftType === "ROTATING") {
        const assignment = await getRotatingShiftAssignment(employee.id, dateOnly);
        await processRotationOvertime(
          existingSession.id,
          deviceUserId,
          dateOnly,
          punchInTime, // Actual punch-in time
          punchOutTime, // Actual punch-out time
          assignment
        );
      } else {
        await processFixedWeeklyOvertime(
          existingSession.id,
          deviceUserId,
          dateOnly,
          punchInTime, // Actual punch-in time
          punchOutTime, // Actual punch-out time
          shiftId
        );
      }

      // Return updated session with overtime
      const finalSession = await prismaWithModels.workSession.findUnique({
        where: { id: existingSession.id },
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

      return transformWorkSessionForResponse(finalSession) as any;
    } else {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Employee has already completed attendance for this date"
      );
    }
  }
  // Format 2: Manual data (explicit punch in/out)
  else {
    processedData = { ...record };
  }

  // Parse punch times with proper date context
  let punchInTime: Date | null = null;
  let punchOutTime: Date | null = null;

  if (processedData.punchIn) {
    if (typeof processedData.punchIn === 'string' && processedData.punchIn.match(/^\d{2}:\d{2}:\d{2}$/)) {
      // Time-only string - combine with date
      punchInTime = createStableDateTime(date, processedData.punchIn);
    } else {
      punchInTime = parseDateTime(processedData.punchIn);
    }
  }

  if (processedData.punchOut) {
    if (typeof processedData.punchOut === 'string' && processedData.punchOut.match(/^\d{2}:\d{2}:\d{2}$/)) {
      // Time-only string - combine with date
      punchOutTime = createStableDateTime(date, processedData.punchOut);
    } else {
      punchOutTime = parseDateTime(processedData.punchOut);
    }
  }

  // Validate punchOut > punchIn if both exist
  if (punchInTime && punchOutTime && punchOutTime <= punchInTime) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Punch out time must be after punch in time"
    );
  }

  // Calculate duration and overtime
  let duration = null;
  let earlyMinutes = 0;
  let lateMinutes = 0;

  if (punchInTime && punchOutTime) {
    duration = calculateDuration(punchInTime, punchOutTime);
  }

  // Normalize punch times to shift schedule
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

  // Calculate deducted minutes (break time + attendance penalties for FIXED_WEEKLY shifts)
  let dedutedMinutes = 0;
  if (shiftId && normalizedPunchIn && normalizedPunchOut) {
    // Get shift day info for deductible calculations
    const dateObj = new Date(dateOnly);
    const jsDay = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNumber = jsDay === 0 ? 7 : jsDay; // Convert to 1-7 format (1 = Monday, 7 = Sunday)
    
    const shiftDay = await prisma.shiftDay.findFirst({
      where: {
        shiftId,
        dayNumber: dayNumber,
      },
    });
    
    if (shiftDay) {
      
      // Start with break time
      dedutedMinutes = shiftDay.breakTime || 0;
      
      // For FIXED_WEEKLY shifts, add attendance penalties (late arrival + early departure)
      if (activeShift.shift.shiftType === "FIXED_WEEKLY" && punchInTime && punchOutTime) {
        const gracePeriodMinutes = shiftDay.gracePeriod || 0;
        
        // Extract time strings from shift DateTime objects and create them on the work date
        const shiftStartTimeStr = formatTime(new Date(shiftDay.startTime));
        const shiftEndTimeStr = formatTime(new Date(shiftDay.endTime));
        
        if (shiftStartTimeStr && shiftEndTimeStr) {
          const workDateStr = date; // Use the work date string (YYYY-MM-DD format)
          const shiftStartTime = createStableDateTime(workDateStr, shiftStartTimeStr);
          const shiftEndTime = createStableDateTime(workDateStr, shiftEndTimeStr);
          
          // Calculate late arrival penalty (beyond grace period)
          if (punchInTime > shiftStartTime) {
            const lateArrivalMinutes = Math.round(
              (punchInTime.getTime() - shiftStartTime.getTime()) / (1000 * 60)
            );
            // Only count as deductible if beyond grace period
            if (lateArrivalMinutes > gracePeriodMinutes) {
              dedutedMinutes += lateArrivalMinutes - gracePeriodMinutes;
            }
          }
          
          // Calculate early departure penalty (beyond grace period)
          if (punchOutTime < shiftEndTime) {
            const earlyDepartureMinutes = Math.round(
              (shiftEndTime.getTime() - punchOutTime.getTime()) / (1000 * 60)
            );
            // Only count as deductible if beyond grace period
            if (earlyDepartureMinutes > gracePeriodMinutes) {
              dedutedMinutes += earlyDepartureMinutes - gracePeriodMinutes;
            }
          }
          
          console.log("=== Bulk Deductible Minutes Calculation (FIXED_WEEKLY) ===");
          console.log("Break time:", shiftDay.breakTime || 0);
          console.log("Grace period:", gracePeriodMinutes);
          console.log("Shift start:", formatTime(shiftStartTime));
          console.log("Shift end:", formatTime(shiftEndTime));
          console.log("Actual punch in:", formatTime(punchInTime));
          console.log("Actual punch out:", formatTime(punchOutTime));
          console.log("Total deductible minutes:", dedutedMinutes);
        }
      }
    }
  }

  // Create WorkSession with normalized times
  const workSession = await prismaWithModels.workSession.create({
    data: {
      deviceUserId,
      date: dateOnly,
      punchIn: normalizedPunchIn,
      punchInSource: processedData.punchInSource || "manual",
      punchOut: normalizedPunchOut,
      punchOutSource: processedData.punchOutSource || "manual",
      duration: normalizedPunchIn && normalizedPunchOut ? calculateDuration(normalizedPunchIn, normalizedPunchOut) : null,
      shiftId,
      earlyMinutes,
      lateMinutes,
      dedutedMinutes,
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
  if (activeShift.shift.shiftType === "ROTATING") {
    console.log("🔄 Processing ROTATION shift overtime");
    const assignment = await getRotatingShiftAssignment(employee.id, dateOnly);
    await processRotationOvertime(
      workSession.id,
      deviceUserId,
      dateOnly,
      punchInTime, // Actual punch-in time
      punchOutTime, // Actual punch-out time
      assignment
    );
  } else {
    console.log("📅 Processing FIXED_WEEKLY shift overtime");
    await processFixedWeeklyOvertime(
      workSession.id,
      deviceUserId,
      dateOnly,
      punchInTime, // Actual punch-in time
      punchOutTime, // Actual punch-out time
      shiftId
    );
  }

  // Return updated WorkSession with overtime records
  const finalWorkSession = await prismaWithModels.workSession.findUnique({
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

// Process bulk attendance records
const processBulkAttendance = async (
  bulkData: BulkAttendanceRequest
): Promise<BulkAttendanceResponse> => {
  console.log("=== Bulk Attendance Processing Started ===");
  console.log(`Total records to process: ${bulkData.attendanceRecords.length}`);

  const results: BulkAttendanceResponse["results"] = [];
  let successfulRecords = 0;
  let failedRecords = 0;

  // Process each attendance record
  for (let i = 0; i < bulkData.attendanceRecords.length; i++) {
    const record = bulkData.attendanceRecords[i];

    console.log(
      `\n--- Processing Record ${i + 1}/${
        bulkData.attendanceRecords.length
      } ---`
    );
    console.log(`DeviceUserId: ${record.deviceUserId}, Date: ${record.date}`);

    try {
      // Validate required fields
      if (!record.deviceUserId || !record.date) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "deviceUserId and date are required for each record"
        );
      }

      // Process the attendance record with internal logic
      const result = await processSingleAttendanceRecord(record);

      results.push({
        index: i,
        success: true,
        data: result,
        deviceUserId: record.deviceUserId,
        date: record.date,
      });

      successfulRecords++;
      console.log(`✅ Record ${i + 1} processed successfully`);
    } catch (error: any) {
      console.log(`❌ Record ${i + 1} failed: ${error.message}`);

      results.push({
        index: i,
        success: false,
        error: error.message,
        deviceUserId: record.deviceUserId,
        date: record.date,
      });

      failedRecords++;
    }
  }

  console.log("\n=== Bulk Attendance Processing Completed ===");
  console.log(
    `Total: ${bulkData.attendanceRecords.length}, Success: ${successfulRecords}, Failed: ${failedRecords}`
  );

  return {
    success: true,
    totalRecords: bulkData.attendanceRecords.length,
    successfulRecords,
    failedRecords,
    results,
  };
};

// Process bulk attendance with transaction support for better performance
const processBulkAttendanceWithTransaction = async (
  bulkData: BulkAttendanceRequest
): Promise<BulkAttendanceResponse> => {
  console.log("=== Bulk Attendance Processing with Transaction Started ===");
  console.log(`Total records to process: ${bulkData.attendanceRecords.length}`);

  const results: BulkAttendanceResponse["results"] = [];
  let successfulRecords = 0;
  let failedRecords = 0;

  // Process records in batches for better performance
  const BATCH_SIZE = 10;
  const batches = [];

  for (let i = 0; i < bulkData.attendanceRecords.length; i += BATCH_SIZE) {
    batches.push(bulkData.attendanceRecords.slice(i, i + BATCH_SIZE));
  }

  console.log(
    `Processing ${batches.length} batches of up to ${BATCH_SIZE} records each`
  );

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    console.log(
      `\n--- Processing Batch ${batchIndex + 1}/${batches.length} (${
        batch.length
      } records) ---`
    );

    // Process batch records in parallel for better performance
    const batchPromises = batch.map(async (record, recordIndex) => {
      const globalIndex = batchIndex * BATCH_SIZE + recordIndex;

      try {
        // Validate required fields
        if (!record.deviceUserId || !record.date) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "deviceUserId and date are required for each record"
          );
        }

        console.log(
          `Processing record ${globalIndex + 1}: ${record.deviceUserId} on ${
            record.date
          }`
        );

        // Process the attendance record with internal logic
        const result = await processSingleAttendanceRecord(record);

        return {
          index: globalIndex,
          success: true,
          data: result,
          deviceUserId: record.deviceUserId,
          date: record.date,
        };
      } catch (error: any) {
        console.log(`❌ Record ${globalIndex + 1} failed: ${error.message}`);

        return {
          index: globalIndex,
          success: false,
          error: error.message,
          deviceUserId: record.deviceUserId,
          date: record.date,
        };
      }
    });

    // Wait for batch to complete
    const batchResults = await Promise.allSettled(batchPromises);

    batchResults.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
        if (result.value.success) {
          successfulRecords++;
        } else {
          failedRecords++;
        }
      } else {
        // Handle promise rejection
        results.push({
          index: results.length,
          success: false,
          error: `Promise rejected: ${result.reason}`,
        });
        failedRecords++;
      }
    });

    console.log(`Batch ${batchIndex + 1} completed`);
  }

  console.log("\n=== Bulk Attendance Processing Completed ===");
  console.log(
    `Total: ${bulkData.attendanceRecords.length}, Success: ${successfulRecords}, Failed: ${failedRecords}`
  );

  return {
    success: true,
    totalRecords: bulkData.attendanceRecords.length,
    successfulRecords,
    failedRecords,
    results,
  };
};

// Bulk attendance service object
const bulkAttendanceService = {
  processBulkAttendance,
  processBulkAttendanceWithTransaction,
};

export default bulkAttendanceService;
