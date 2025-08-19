import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

interface CreateAttendanceData {
  deviceUserId: string;
  checkTime: Date | string;
  date?: Date | string;
  checkType?: "PUNCHIN" | "PUNCHOUT";
  verifyMode?: number;
  workCode?: number;
  sensorId?: string;
  deviceIp?: string;
  isAbsent?: boolean;
}

interface ShiftInfo {
  shiftId: string;
  shiftType: "FIXED_WEEKLY" | "ROTATION";
  startDate: Date;
  endDate?: Date;
  shift: {
    id: string;
    name: string;
    shiftType: "FIXED_WEEKLY" | "ROTATION";
    cycleDays?: number;
    patternDays?: Array<{
      id: string;
      dayNumber: number;
      dayType: string;
      startTime: Date;
      endTime: Date;
      breakTime: number;
      gracePeriod: number;
    }>;
  };
}

interface RotatingShiftInfo {
  shiftTypeId: string;
  rotatingShiftType: {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: number;
  };
  hours: number;
  date: Date;
}

// Helper function to parse checkTime in various formats
const parseCheckTime = (
  checkTime: string | Date,
  date?: string | Date
): Date => {
  if (checkTime instanceof Date) {
    return checkTime;
  }

  let parsedDate: Date;

  if (checkTime.includes("T") || checkTime.includes(" ")) {
    // ISO format or space-separated format
    parsedDate = new Date(checkTime);
  } else {
    // HH:MM:SS format - need to combine with date
    const [hours, minutes, seconds] = checkTime.split(":").map(Number);

    if (date) {
      const baseDate = new Date(date);
      parsedDate = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth(),
        baseDate.getDate(),
        hours,
        minutes,
        seconds
      );
    } else {
      // Use current date if no date provided
      const now = new Date();
      parsedDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        hours,
        minutes,
        seconds
      );
    }
  }

  if (isNaN(parsedDate.getTime())) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid checkTime format: ${checkTime}`
    );
  }

  return parsedDate;
};

// Helper function to get employee with shift information
const getEmployeeWithShifts = async (deviceUserId: string): Promise<any> => {
  return await prisma.employee.findFirst({
    where: { deviceUserId },
    include: {
      company: true,
      employeeShifts: {
        where: {
          // isActive: true,
          startDate: { lte: new Date() },
          // OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
        include: {
          shift: {
            include: {
              patternDays: {
                orderBy: { dayNumber: "asc" },
              },
            },
          },
        },
      },
    },
  });
};

// Helper function to get rotating shift assignment for a specific date
const getRotatingShiftAssignment = async (
  employeeId: string,
  date: Date,
  companyId: string
): Promise<RotatingShiftInfo | null> => {
  const result = await prisma.employeeShiftAssignment.findFirst({
    where: {
      employeeId,
      date,
      // isApproved: true,
    },
    include: {
      RotatingShiftType: true,
      // rotatingShiftType: true,
    },
  });

  if (!result || !result.RotatingShiftType) {
    return null;
  }

  // Transform the result to match RotatingShiftInfo interface
  return {
    shiftTypeId: result.shiftTypeId || "",
    rotatingShiftType: {
      id: result.RotatingShiftType.id,
      name: result.RotatingShiftType.name,
      startTime: result.RotatingShiftType.startTime,
      endTime: result.RotatingShiftType.endTime,
      duration: result.RotatingShiftType.duration,
    },
    hours: result.hours,
    date: result.date,
  };
};

// Helper function to get shift day for FIXED_WEEKLY shifts
const getShiftDayForDate = async (
  shiftId: string,
  date: Date,
  cycleDays: number = 7
): Promise<any> => {
  // Get the day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  // Convert to our system: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  let dayOfWeek = date.getDay();
  if (dayOfWeek === 0) dayOfWeek = 7; // Sunday becomes 7

  console.log(`Date: ${date.toDateString()}, Day of week: ${dayOfWeek}`);

  return await prisma.shiftDay.findFirst({
    where: {
      shiftId,
      dayNumber: dayOfWeek,
    },
  });
};

// Helper function to format time as HH:MM:SS
const formatTimeAsHHMMSS = (date: Date): string => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// Helper function to calculate duration between two times
const calculateDuration = (startTime: Date, endTime: Date): number => {
  const diffMs = endTime.getTime() - startTime.getTime();
  return Math.round(diffMs / (1000 * 60)); // Return duration in minutes
};

// Helper function to check if time is within shift range with grace period
const isWithinShiftRange = (
  checkTime: Date,
  shiftStart: Date,
  shiftEnd: Date,
  gracePeriodMinutes: number = 0
): { isWithin: boolean; isEarly: boolean; isLate: boolean } => {
  const gracePeriodMs = gracePeriodMinutes * 60 * 1000;

  const earlyThreshold = new Date(shiftStart.getTime() - gracePeriodMs);
  const lateThreshold = new Date(shiftEnd.getTime() + gracePeriodMs);

  const isEarly = checkTime < earlyThreshold;
  const isLate = checkTime > lateThreshold;
  const isWithin = !isEarly && !isLate;

  return { isWithin, isEarly, isLate };
};

// Helper function to create overtime record
const createOvertimeRecord = async (
  employeeId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  reason: string,
  status: string = "PENDING"
) => {
  const duration = calculateDuration(startTime, endTime);

  return await prisma.overtime.create({
    data: {
      employeeId,
      date,
      startTime,
      endTime,
      duration,
      reason: reason as any,
      status: status as any,
      approvedAt: status === "APPROVED" ? new Date() : null,
    },
  });
};

// Helper function to check if overtime already exists
const checkExistingOvertime = async (
  employeeId: string,
  date: Date,
  reason: string
): Promise<boolean> => {
  const existing = await prisma.overtime.findFirst({
    where: {
      employeeId,
      date,
      reason: reason as any,
    },
  });
  return !!existing;
};

// Enhanced overtime processing for both shift types
const processOvertimeLogic = async (
  tx: any,
  deviceUserId: string,
  checkTimeDate: Date,
  dateOnly: Date,
  isAbsent: boolean = false
) => {
  const employee = await getEmployeeWithShifts(deviceUserId);
  if (!employee) {
    return; // No employee found, skip overtime processing
  }

  // Check for holiday
  const holiday = await tx.workingCalendar.findFirst({
    where: {
      companyId: employee.companyId,
      date: dateOnly,
      dayType: "HOLIDAY",
      isActive: true,
    },
  });

  // Get paired punches for overtime calculation
  const punches = await tx.attendance.findMany({
    where: {
      deviceUserId,
      date: dateOnly,
      isAbsent: false,
    },
    orderBy: { checkTime: "asc" },
  });

  const punchIn = punches.find((p: any) => p.checkType === "PUNCHIN");
  const punchOut = punches.find((p: any) => p.checkType === "PUNCHOUT");

  // Holiday overtime logic
  if (holiday && (punchIn || punchOut)) {
    const overtimeExists = await checkExistingOvertime(
      employee.id,
      dateOnly,
      "HOLIDAY_WORK"
    );

    if (!overtimeExists) {
      const startTime = punchIn?.checkTime || checkTimeDate;
      const endTime = punchOut?.checkTime || checkTimeDate;

      await createOvertimeRecord(
        employee.id,
        dateOnly,
        startTime,
        endTime,
        "HOLIDAY_WORK",
        "APPROVED"
      );
    }
  }

  // Get active shift
  const activeShift = employee.employeeShifts[0];
  if (!activeShift || isAbsent) {
    return;
  }

  // Process based on shift type
  if (activeShift.shift.shiftType === "FIXED_WEEKLY") {
    await processFixedWeeklyOvertime(
      tx,
      employee.id,
      dateOnly,
      checkTimeDate,
      activeShift,
      punchIn,
      punchOut
    );
  } else if (activeShift.shift.shiftType === "ROTATION") {
    await processRotationOvertime(
      tx,
      employee.id,
      dateOnly,
      checkTimeDate,
      employee.companyId,
      punchIn,
      punchOut
    );
  }
};

// Process overtime for FIXED_WEEKLY shifts
const processFixedWeeklyOvertime = async (
  tx: any,
  employeeId: string,
  date: Date,
  checkTime: Date,
  shiftInfo: ShiftInfo,
  punchIn: any,
  punchOut: any
) => {
  const shiftDay = await getShiftDayForDate(
    shiftInfo.shiftId,
    date,
    shiftInfo.shift.cycleDays
  );

  if (!shiftDay) {
    console.log(`No shift day found for date: ${date.toDateString()}`);
    return; // No shift day defined for this date
  }

  console.log(
    `Shift day found: Day ${shiftDay.dayNumber}, Type: ${shiftDay.dayType}`
  );
  console.log(`Shift times: ${shiftDay.startTime} - ${shiftDay.endTime}`);
  console.log(`Grace period: ${shiftDay.gracePeriod} minutes`);

  const shiftStartTime = new Date(shiftDay.startTime);
  const shiftEndTime = new Date(shiftDay.endTime);
  const gracePeriod = shiftDay.gracePeriod || 0;

  console.log(`Shift start: ${shiftStartTime.toTimeString()}`);
  console.log(`Shift end: ${shiftEndTime.toTimeString()}`);
  console.log(`Check time: ${checkTime.toTimeString()}`);

  // Check if punch is outside shift boundaries
  const isEarly = checkTime < shiftStartTime;
  const isLate = checkTime > shiftEndTime;

  console.log(`Is early: ${isEarly}, Is late: ${isLate}`);

  // Early punch-in overtime (before shift start)
  if (isEarly) {
    console.log(`Creating UNSCHEDULED_WORK overtime for early punch-in`);
    const overtimeExists = await checkExistingOvertime(
      employeeId,
      date,
      "UNSCHEDULED_WORK"
    );

    if (!overtimeExists) {
      const endTime = punchOut?.checkTime || shiftStartTime;
      await createOvertimeRecord(
        employeeId,
        date,
        checkTime, // Original early time
        endTime,
        "UNSCHEDULED_WORK"
      );
    }
  }

  // Late punch-out overtime (after shift end)
  if (isLate) {
    console.log(`Creating EXTENDED_SHIFT overtime for late punch-out`);
    const overtimeExists = await checkExistingOvertime(
      employeeId,
      date,
      "EXTENDED_SHIFT"
    );

    if (!overtimeExists) {
      const startTime = punchIn?.checkTime || shiftEndTime;
      await createOvertimeRecord(
        employeeId,
        date,
        startTime,
        checkTime, // Original late time
        "EXTENDED_SHIFT"
      );
    }
  }
};

// Process overtime for ROTATION shifts
const processRotationOvertime = async (
  tx: any,
  employeeId: string,
  date: Date,
  checkTime: Date,
  companyId: string,
  punchIn: any,
  punchOut: any
) => {
  const shiftAssignment = await getRotatingShiftAssignment(
    employeeId,
    date,
    companyId
  );

  if (!shiftAssignment || shiftAssignment.hours === 0) {
    return; // No shift assigned or OFF day
  }

  const { startTime: shiftStartStr, endTime: shiftEndStr } =
    shiftAssignment.rotatingShiftType;

  // Convert time strings to Date objects for the specific date
  const [startHours, startMinutes, startSeconds] = shiftStartStr
    .split(":")
    .map(Number);
  const [endHours, endMinutes, endSeconds] = shiftEndStr.split(":").map(Number);

  const shiftStartTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    startHours,
    startMinutes,
    startSeconds
  );

  let shiftEndTime = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    endHours,
    endMinutes,
    endSeconds
  );

  // Handle overnight shifts (end time is next day)
  if (shiftEndTime <= shiftStartTime) {
    shiftEndTime.setDate(shiftEndTime.getDate() + 1);
  }

  // Get company grace period
  const gracePeriod = await tx.overtimeGracePeriod.findFirst({
    where: {
      companyId,
      isActive: true,
    },
  });

  const gracePeriodMinutes = gracePeriod ? gracePeriod.gracePeriodMinutes : 0;

  console.log(
    `Rotation shift: ${shiftStartTime.toTimeString()} - ${shiftEndTime.toTimeString()}`
  );
  console.log(`Company grace period: ${gracePeriodMinutes} minutes`);

  // Check if punch is outside shift boundaries (no grace period consideration for overtime)
  const isEarly = checkTime < shiftStartTime;
  const isLate = checkTime > shiftEndTime;

  // Early punch-in overtime
  if (isEarly) {
    const overtimeExists = await checkExistingOvertime(
      employeeId,
      date,
      "UNSCHEDULED_WORK"
    );

    if (!overtimeExists) {
      const endTime = punchOut?.checkTime || shiftStartTime;
      await createOvertimeRecord(
        employeeId,
        date,
        checkTime,
        endTime,
        "UNSCHEDULED_WORK"
      );
    }
  }

  // Late punch-out overtime
  if (isLate) {
    const overtimeExists = await checkExistingOvertime(
      employeeId,
      date,
      "EXTENDED_SHIFT"
    );

    if (!overtimeExists) {
      const startTime = punchIn?.checkTime || shiftEndTime;
      await createOvertimeRecord(
        employeeId,
        date,
        startTime,
        checkTime,
        "EXTENDED_SHIFT"
      );
    }
  }
};

// Handle REST_DAY work - skip attendance, create overtime directly
const handleRestDayWork = async (
  tx: any,
  deviceUserId: string,
  date: Date,
  checkTime: Date,
  checkType: string,
  employee: any
) => {
  console.log(`Handling REST_DAY work for ${checkType}`);
  
  // For REST_DAY, we don't create attendance records
  // Instead, we handle overtime creation based on punch type
  
  if (checkType === "PUNCHIN") {
    // First punch-in on rest day - store in temporary state or create overtime record
    console.log(`REST_DAY PUNCHIN - storing for overtime calculation`);
    
    // Return a special response indicating this is rest day work
    return {
      id: `rest-day-${Date.now()}`,
      deviceUserId,
      checkTime: formatTimeAsHHMMSS(checkTime),
      date: date.toISOString().split('T')[0],
      checkType,
      isRestDay: true,
      message: "REST_DAY work - overtime will be calculated on punch-out",
      createdAt: new Date().toISOString(),
    };
    
  } else if (checkType === "PUNCHOUT") {
    // Second punch (punch-out) on rest day - create HOLIDAY_WORK overtime
    console.log(`REST_DAY PUNCHOUT - creating HOLIDAY_WORK overtime`);
    
    // Find the punch-in record for this day (could be from earlier or stored temporarily)
    const punchIn = await tx.attendance.findFirst({
      where: {
        deviceUserId,
        date,
        checkType: "PUNCHIN",
      },
      orderBy: { checkTime: "asc" },
    });
    
    let startTime = checkTime;
    let endTime = checkTime;
    
    if (punchIn) {
      // Use the punch-in time as start time
      startTime = punchIn.checkTime;
      endTime = checkTime;
      console.log(`Using punch-in time: ${startTime.toTimeString()} to punch-out: ${endTime.toTimeString()}`);
    }
    
    // Create HOLIDAY_WORK overtime
    const overtimeExists = await checkExistingOvertime(
      employee.id,
      date,
      "HOLIDAY_WORK"
    );
    
    if (!overtimeExists) {
      await createOvertimeRecord(
        employee.id,
        date,
        startTime,
        endTime,
        "HOLIDAY_WORK",
        "APPROVED" // Rest day work is automatically approved
      );
      console.log(`HOLIDAY_WORK overtime created: ${startTime.toTimeString()} - ${endTime.toTimeString()}`);
    }
    
    // Return response for rest day punch-out
    return {
      id: `rest-day-out-${Date.now()}`,
      deviceUserId,
      checkTime: formatTimeAsHHMMSS(checkTime),
      date: date.toISOString().split('T')[0],
      checkType,
      isRestDay: true,
      message: "REST_DAY work completed - HOLIDAY_WORK overtime created",
      overtimeCreated: true,
      createdAt: new Date().toISOString(),
    };
  }
  
  // Fallback response
  return {
    id: `rest-day-${Date.now()}`,
    deviceUserId,
    checkTime: formatTimeAsHHMMSS(checkTime),
    date: date.toISOString().split('T')[0],
    checkType,
    isRestDay: true,
    message: "REST_DAY work processed",
    createdAt: new Date().toISOString(),
  };
};

// Enhanced create attendance function
const createEnhancedAttendance = async (data: CreateAttendanceData) => {
  const {
    deviceUserId,
    date,
    checkTime,
    checkType,
    verifyMode,
    workCode,
    sensorId,
    deviceIp,
    isAbsent = false,
  } = data;

  if (!deviceUserId || !checkTime) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Device user ID and check time are required"
    );
  }
  // Parse checkTime and date
  const checkTimeDate = parseCheckTime(checkTime, date);
  const dateOnly = date
    ? new Date(date)
    : new Date(
        checkTimeDate.getFullYear(),
        checkTimeDate.getMonth(),
        checkTimeDate.getDate()
      );
  return await prisma.$transaction(async (tx) => {
    // Count existing punches for this user & date
    const existingPunches = await tx.attendance.findMany({
      where: {
        deviceUserId,
        date: dateOnly,
      },
      orderBy: { checkTime: "asc" },
    });

    const punchesCount = existingPunches.length;
    console.log(`Existing punches count: ${punchesCount}`);

    if (punchesCount >= 2) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User already has maximum punches for this date (limit: 2 punches per day)"
      );
    }

    // Check for duplicate punch types within the same shift day
    if (punchesCount > 0) {
      const existingPunchTypes = existingPunches.map((p) => p.checkType);
      console.log(`Existing punch types: ${existingPunchTypes}`);

      if (checkType && existingPunchTypes.includes(checkType)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `User already has a ${checkType} punch for this date`
        );
      }
    }

    // Automatically determine punch type if not provided and not absent
    let finalCheckType = checkType;

    if (!finalCheckType && !isAbsent) {
      const hasPunchIn = existingPunches.some((p) => p.checkType === "PUNCHIN");
      const hasPunchOut = existingPunches.some(
        (p) => p.checkType === "PUNCHOUT"
      );

      if (hasPunchIn && hasPunchOut) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "User already has both punch in and punch out for this date"
        );
      }

      if (hasPunchIn) {
        finalCheckType = "PUNCHOUT";
      } else if (hasPunchOut) {
        finalCheckType = "PUNCHIN";
      } else {
        finalCheckType = "PUNCHIN";
      }
    }

    console.log(`Final check type: ${finalCheckType}`);

    // Adjust checkTime based on grace period rules for FIXED_WEEKLY shifts
    let adjustedCheckTime = checkTimeDate;

    if (!isAbsent && finalCheckType) {
      const employee = await getEmployeeWithShifts(deviceUserId);

      console.log("gemechuuu ");
      console.log(employee);
      const activeShift = employee?.employeeShifts?.[0];

      if (activeShift && activeShift.shift.shiftType === "FIXED_WEEKLY") {
        const shiftDay = await getShiftDayForDate(
          activeShift.shiftId,
          dateOnly,
          activeShift.shift.cycleDays
        );

        if (shiftDay) {
          console.log(`Shift day found: Day ${shiftDay.dayNumber}, Type: ${shiftDay.dayType}`);
          
          // Check if this is a REST_DAY - if so, skip attendance and go to overtime
          if (shiftDay.dayType === "REST_DAY") {
            console.log(`REST_DAY detected - will skip attendance and create overtime directly`);
            
            // For REST_DAY, we don't need to adjust time or create regular attendance
            // We'll handle overtime creation separately
            return await handleRestDayWork(tx, deviceUserId, dateOnly, checkTimeDate, finalCheckType, employee);
          }
          
          // Regular WORK_DAY or HALF_DAY - proceed with normal logic
          const shiftStartTime = new Date(shiftDay.startTime);
          const shiftEndTime = new Date(shiftDay.endTime);

          // Get company grace period for time adjustment
          const companyGracePeriod = await tx.overtimeGracePeriod.findFirst({
            where: {
              companyId: employee.companyId,
              isActive: true,
            },
          });

          const companyGraceMinutes = companyGracePeriod
            ? companyGracePeriod.gracePeriodMinutes
            : 0;

          console.log(
            `Adjusting time for shift: ${shiftStartTime.toTimeString()} - ${shiftEndTime.toTimeString()}`
          );
          console.log(`Company grace period: ${companyGraceMinutes} minutes`);

          if (finalCheckType === "PUNCHIN") {
            // For punch-in: if within company grace period, adjust to shift start time
            const earlyThreshold = new Date(
              shiftStartTime.getTime() - companyGraceMinutes * 60 * 1000
            );
            if (checkTimeDate <= earlyThreshold) {
              // Before company grace period - keep original time (will create overtime)
              console.log(
                `Punch-in before company grace period, keeping original time: ${checkTimeDate.toTimeString()}`
              );
            } else if (checkTimeDate < shiftStartTime) {
              // Within company grace period - adjust to shift start time
              adjustedCheckTime = shiftStartTime;
              console.log(
                `Punch-in within company grace period, adjusting to shift start: ${adjustedCheckTime.toTimeString()}`
              );
            }
          } else if (finalCheckType === "PUNCHOUT") {
            // For punch-out: if within company grace period, adjust to shift end time
            const lateThreshold = new Date(
              shiftEndTime.getTime() + companyGraceMinutes * 60 * 1000
            );
            if (checkTimeDate >= lateThreshold) {
              // After company grace period - keep original time (will create overtime)
              console.log(
                `Punch-out after company grace period, keeping original time: ${checkTimeDate.toTimeString()}`
              );
            } else if (checkTimeDate > shiftEndTime) {
              // Within company grace period - adjust to shift end time
              adjustedCheckTime = shiftEndTime;
              console.log(
                `Punch-out within company grace period, adjusting to shift end: ${adjustedCheckTime.toTimeString()}`
              );
            }
          }
        }
      } else if (activeShift && activeShift.shift.shiftType === "ROTATION") {
        // Handle ROTATION shift time adjustment
        const shiftAssignment = await getRotatingShiftAssignment(
          employee.id,
          dateOnly,
          employee.companyId
        );

        if (shiftAssignment && shiftAssignment.hours > 0) {
          const { startTime: shiftStartStr, endTime: shiftEndStr } =
            shiftAssignment.rotatingShiftType;

          // Convert time strings to Date objects for the specific date
          const [startHours, startMinutes, startSeconds] = shiftStartStr
            .split(":")
            .map(Number);
          const [endHours, endMinutes, endSeconds] = shiftEndStr
            .split(":")
            .map(Number);

          const shiftStartTime = new Date(
            dateOnly.getFullYear(),
            dateOnly.getMonth(),
            dateOnly.getDate(),
            startHours,
            startMinutes,
            startSeconds
          );

          let shiftEndTime = new Date(
            dateOnly.getFullYear(),
            dateOnly.getMonth(),
            dateOnly.getDate(),
            endHours,
            endMinutes,
            endSeconds
          );

          // Handle overnight shifts (end time is next day)
          if (shiftEndTime <= shiftStartTime) {
            shiftEndTime.setDate(shiftEndTime.getDate() + 1);
          }

          // Get company grace period for time adjustment
          const companyGracePeriod = await tx.overtimeGracePeriod.findFirst({
            where: {
              companyId: employee.companyId,
              isActive: true,
            },
          });

          const companyGraceMinutes = companyGracePeriod
            ? companyGracePeriod.gracePeriodMinutes
            : 0;

          console.log(
            `Adjusting time for rotation shift: ${shiftStartTime.toTimeString()} - ${shiftEndTime.toTimeString()}`
          );
          console.log(`Company grace period: ${companyGraceMinutes} minutes`);

          if (finalCheckType === "PUNCHIN") {
            // For punch-in: if within company grace period, adjust to shift start time
            const earlyThreshold = new Date(
              shiftStartTime.getTime() - companyGraceMinutes * 60 * 1000
            );
            if (checkTimeDate <= earlyThreshold) {
              // Before company grace period - keep original time (will create overtime)
              console.log(
                `Punch-in before company grace period, keeping original time: ${checkTimeDate.toTimeString()}`
              );
            } else if (checkTimeDate < shiftStartTime) {
              // Within company grace period - adjust to shift start time
              adjustedCheckTime = shiftStartTime;
              console.log(
                `Punch-in within company grace period, adjusting to shift start: ${adjustedCheckTime.toTimeString()}`
              );
            }
          } else if (finalCheckType === "PUNCHOUT") {
            // For punch-out: if within company grace period, adjust to shift end time
            const lateThreshold = new Date(
              shiftEndTime.getTime() + companyGraceMinutes * 60 * 1000
            );
            if (checkTimeDate >= lateThreshold) {
              // After company grace period - keep original time (will create overtime)
              console.log(
                `Punch-out after company grace period, keeping original time: ${checkTimeDate.toTimeString()}`
              );
            } else if (checkTimeDate > shiftEndTime) {
              // Within company grace period - adjust to shift end time
              adjustedCheckTime = shiftEndTime;
              console.log(
                `Punch-out within company grace period, adjusting to shift end: ${adjustedCheckTime.toTimeString()}`
              );
            }
          }
        }
      }
    }

    // Create attendance record
    const attendance = await tx.attendance.create({
      data: {
        deviceUserId,
        checkTime: adjustedCheckTime, // Use adjusted time based on grace period
        date: dateOnly,
        checkType: finalCheckType!, // Assert non-null since we always set it
        verifyMode,
        workCode,
        sensorId,
        deviceIp,
        isAbsent,
      },
    });

    // Process overtime logic - use original checkTime for overtime calculation
    await processOvertimeLogic(
      tx,
      deviceUserId,
      checkTimeDate, // Use original time for overtime calculation
      dateOnly,
      isAbsent
    );

    // Format the response to show time as HH:MM:SS
    const formattedAttendance = {
      ...attendance,
      checkTime: formatTimeAsHHMMSS(attendance.checkTime),
      date: attendance.date.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      createdAt: attendance.createdAt.toISOString(),
    };

    console.log("Formatted attendance response:", formattedAttendance);
    return formattedAttendance;
  });
};

// Enhanced bulk create attendance function
const bulkCreateEnhancedAttendance = async (
  records: CreateAttendanceData[]
) => {
  const results = [];
  const errors = [];

  for (let i = 0; i < records.length; i++) {
    try {
      const record = records[i];
      const result = await createEnhancedAttendance(record);
      results.push(result);
    } catch (error: any) {
      errors.push({
        index: i,
        record: records[i],
        error: error.message,
      });
    }
  }

  return {
    success: results.length,
    failed: errors.length,
    results,
    errors,
  };
};

export {
  createEnhancedAttendance,
  bulkCreateEnhancedAttendance,
  parseCheckTime,
  formatTimeAsHHMMSS,
  getEmployeeWithShifts,
  getRotatingShiftAssignment,
  getShiftDayForDate,
  processOvertimeLogic,
  processFixedWeeklyOvertime,
  processRotationOvertime,
  handleRestDayWork,
};
