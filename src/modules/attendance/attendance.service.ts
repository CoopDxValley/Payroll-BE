import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

interface CreateAttendanceData {
  deviceUserId: string; // required
  checkTime: Date | string; // required - the full timestamp
  date?: Date | string; // optional - derived from checkTime if missing
  checkType?: "PUNCHIN" | "PUNCHOUT"; // optional - determined if missing
  verifyMode?: number;
  workCode?: number;
  sensorId?: string;
  deviceIp?: string;
  isAbsent?: boolean;
}

// Helper function to check if overtime already exists for the same employee/date/reason
const checkExistingOvertime = async (
  employeeId: string,
  date: Date,
  reason: string
): Promise<boolean> => {
  const existingOvertime = await prisma.overtime.findFirst({
    where: {
      employeeId,
      date,
      reason: reason as any, // Cast to enum type
    },
  });
  return !!existingOvertime;
};

// Helper function to create overtime record
const createOvertimeRecord = async (
  employeeId: string,
  date: Date,
  startTime: Date,
  endTime: Date,
  reason: string,
  status: string = "APPROVED"
) => {
  const duration = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );

  return await prisma.overtime.create({
    data: {
      employeeId,
      date,
      startTime,
      endTime,
      duration,
      reason: reason as any, // Cast to enum type
      status: status as any, // Cast to enum type
      approvedAt: status === "APPROVED" ? new Date() : null,
    },
  });
};

// Helper function to get employee with company and shift information
const getEmployeeWithDetails = async (deviceUserId: string) => {
  return await prisma.employee.findFirst({
    where: { deviceUserId },
    include: {
      company: true,
      employeeShifts: {
        where: {
          isActive: true,
          startDate: { lte: new Date() },
          OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
        },
        include: {
          shift: {
            include: {
              patternDays: true,
            },
          },
        },
      },
    },
  });
};

// Helper function to check if date is a holiday
const checkHoliday = async (companyId: string, date: Date) => {
  return await prisma.workingCalendar.findFirst({
    where: {
      companyId,
      date,
      dayType: "HOLIDAY",
      isActive: true,
    },
  });
};

// Helper function to get active overtime grace period for a company
const getActiveOvertimeGracePeriod = async (companyId: string) => {
  const gracePeriod = await prisma.overtimeGracePeriod.findFirst({
    where: {
      companyId,
      isActive: true,
    },
  });

  // Return grace period in minutes, default to 0 if none found
  return gracePeriod ? gracePeriod.gracePeriodMinutes : 0;
};

// Helper function to determine if time worked is overtime based on grace period
const isOvertimeWithGracePeriod = (
  scheduledStartTime: Date,
  scheduledEndTime: Date,
  actualPunchIn: Date,
  actualPunchOut: Date,
  gracePeriodMinutes: number
): boolean => {
  // Convert grace period to milliseconds
  const gracePeriodMs = gracePeriodMinutes * 60 * 1000;

  // Calculate allowed time boundaries with grace period
  const allowedStartTime = new Date(
    scheduledStartTime.getTime() - gracePeriodMs
  );
  const allowedEndTime = new Date(scheduledEndTime.getTime() + gracePeriodMs);

  // Check if punch-in is before allowed start time (overtime)
  const isEarlyPunchIn = actualPunchIn < allowedStartTime;

  // Check if punch-out is after allowed end time (overtime)
  const isLatePunchOut = actualPunchOut > allowedEndTime;

  // Return true if either condition is met (meaning it's overtime)
  return isEarlyPunchIn || isLatePunchOut;
};

// Comprehensive function to check overtime with company grace period
const checkOvertimeWithCompanyGracePeriod = async (
  companyId: string,
  scheduledStartTime: Date,
  scheduledEndTime: Date,
  actualPunchIn: Date,
  actualPunchOut: Date
): Promise<boolean> => {
  // Get the active grace period for the company (defaults to 0 if none found)
  const gracePeriodMinutes = await getActiveOvertimeGracePeriod(companyId);

  // Use the overtime checking function
  return isOvertimeWithGracePeriod(
    scheduledStartTime,
    scheduledEndTime,
    actualPunchIn,
    actualPunchOut,
    gracePeriodMinutes
  );
};

// Helper function to get shift day for a specific date
const getShiftDayForDate = async (
  shiftId: string,
  date: Date,
  cycleDays: number
) => {
  // Calculate which day in the cycle this date represents
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor(
    (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
  );
  const cycleDay = (dayOfYear % cycleDays) + 1;

  return await prisma.shiftDay.findFirst({
    where: {
      shiftId,
      dayNumber: cycleDay,
    },
  });
};

// Helper function to parse timestamps consistently
const parseTimestamp = (timestamp: string | Date): Date => {
  if (timestamp instanceof Date) {
    if (isNaN(timestamp.getTime())) {
      throw new Error(`Invalid timestamp: ${timestamp}`);
    }
    return timestamp;
  }

  // Handle different timestamp formats
  if (timestamp.includes(" ")) {
    // Format: "2025-08-11 07:05:31"
    const [datePart, timePart] = timestamp.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute, second] = timePart.split(":").map(Number);

    // Create date in local timezone (month is 0-indexed)
    return new Date(year, month - 1, day, hour, minute, second);
  } else if (timestamp.includes("T")) {
    // Already in ISO format
    return new Date(timestamp);
  } else {
    // Try direct parsing
    return new Date(timestamp);
  }
};

// Helper function to get paired punches for overtime calculation
const getPairedPunches = async (deviceUserId: string, date: Date) => {
  const punches = await prisma.attendance.findMany({
    where: {
      deviceUserId,
      date,
      isAbsent: false,
    },
    orderBy: {
      checkTime: "asc",
    },
  });

  const punchIn = punches.find((p) => p.checkType === "PUNCHIN");
  const punchOut = punches.find((p) => p.checkType === "PUNCHOUT");

  return { punchIn, punchOut };
};

// Helper function to process overtime logic for a single attendance record
const processOvertimeLogic = async (
  tx: any,
  deviceUserId: string,
  checkTimeDate: Date,
  dateOnly: Date,
  isAbsent: boolean = false
) => {
  // Get employee details with company and shift information
  const employee = await getEmployeeWithDetails(deviceUserId);
  if (!employee) {
    return; // No employee found, skip overtime processing
  }

  // Check for holiday
  const holiday = await checkHoliday(employee.companyId, dateOnly);

  // Get active shift for the employee
  const activeShift = employee.employeeShifts[0];

  console.log("dhfjdhfdjfhdhfhhdhjdhjdjhd");
  console.log(activeShift);

  // Get paired punches for overtime calculation
  const { punchIn, punchOut } = await getPairedPunches(deviceUserId, dateOnly);

  // Holiday overtime logic
  if (holiday) {
    const overtimeExists = await checkExistingOvertime(
      employee.id,
      dateOnly,
      "HOLIDAY_WORK"
    );

    if (!overtimeExists && (punchIn || punchOut)) {
      const startTime = punchIn?.checkTime || checkTimeDate;
      const endTime = punchOut?.checkTime || checkTimeDate;

      await tx.overtime.create({
        data: {
          employeeId: employee.id,
          date: dateOnly,
          startTime,
          endTime,
          duration: Math.round(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60)
          ),
          reason: "HOLIDAY_WORK",
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });
    }
  }

  // Shift range overtime logic
  if (activeShift && !isAbsent) {
    const shiftDay = await getShiftDayForDate(
      activeShift.shiftId,
      dateOnly,
      activeShift.shift.cycleDays
    );

    if (shiftDay) {
      const shiftStartTime = new Date(shiftDay.startTime);
      const shiftEndTime = new Date(shiftDay.endTime);

      // Get company-level overtime grace period (default to 0 if none found)
      const companyGracePeriodMinutes = await getActiveOvertimeGracePeriod(
        employee.companyId
      );
      const gracePeriodMs = companyGracePeriodMinutes * 60 * 1000; // Convert minutes to milliseconds

      const earlyStart = new Date(shiftStartTime.getTime() - gracePeriodMs);
      const lateEnd = new Date(shiftEndTime.getTime() + gracePeriodMs);

      // Check if punch is outside shift range
      if (checkTimeDate < earlyStart) {
        // Before shift start - UNSCHEDULED_WORK
        const overtimeExists = await checkExistingOvertime(
          employee.id,
          dateOnly,
          "UNSCHEDULED_WORK"
        );

        if (!overtimeExists) {
          const endTime =
            punchOut?.checkTime ||
            new Date(shiftStartTime.getTime() + gracePeriodMs);
          await tx.overtime.create({
            data: {
              employeeId: employee.id,
              date: dateOnly,
              startTime: checkTimeDate,
              endTime,
              duration: Math.round(
                (endTime.getTime() - checkTimeDate.getTime()) / (1000 * 60)
              ),
              reason: "UNSCHEDULED_WORK",
              status: "PENDING",
            },
          });
        }
      } else if (checkTimeDate > lateEnd) {
        // After shift end - EXTENDED_SHIFT
        const overtimeExists = await checkExistingOvertime(
          employee.id,
          dateOnly,
          "EXTENDED_SHIFT"
        );

        if (!overtimeExists) {
          const startTime =
            punchIn?.checkTime ||
            new Date(shiftEndTime.getTime() - gracePeriodMs);
          await tx.overtime.create({
            data: {
              employeeId: employee.id,
              date: dateOnly,
              startTime,
              endTime: checkTimeDate,
              duration: Math.round(
                (checkTimeDate.getTime() - startTime.getTime()) / (1000 * 60)
              ),
              reason: "EXTENDED_SHIFT",
              status: "PENDING",
            },
          });
        }
      }
    }
  }
};

function formatDateToYYYYMMDD(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}
const createAttendance = async (data: CreateAttendanceData) => {
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

  function parseDateOnly(dateInput: string | Date): Date {
    if (dateInput instanceof Date) {
      if (isNaN(dateInput.getTime())) {
        throw new ApiError(httpStatus.BAD_REQUEST, `Invalid date`);
      }
      return dateInput;
    }
    // else string:
    const isoDateStr = dateInput + "T00:00:00Z";
    const d = new Date(isoDateStr);
    if (isNaN(d.getTime())) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid date: ${dateInput}`);
    }
    return d;
  }

  function parseCheckTime(dateTimeInput: string | Date): Date {
    try {
      return parseTimestamp(dateTimeInput);
    } catch (error) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid checkTime: ${dateTimeInput}`
      );
    }
  }

  // Helper to get shift cycle day number (1 to cycleDays)
  function getShiftCycleDayNumber(shiftStartDate: Date, targetDate: Date, cycleDays: number): number {
    const diffTime = targetDate.getTime() - shiftStartDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return (diffDays % cycleDays) + 1;
  }

  const checkTimeDate = parseCheckTime(checkTime);
  const dateOnly = date
    ? parseDateOnly(date)
    : parseDateOnly(checkTimeDate.toISOString().slice(0, 10));

  return await prisma.$transaction(async (tx) => {
    // Count existing punches for this user & date
    const punchesCount = await tx.attendance.count({
      where: {
        deviceUserId,
        date: dateOnly,
      },
    });

    if (punchesCount >= 2) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User already has maximum punches for this date (limit: 2 punches per day)"
      );
    }

    // Automatically determine punch type if not provided and not absent
    let finalCheckType = checkType;

    if (!finalCheckType && !isAbsent) {
      // Get all punches to check existing punch types
      const punches = await tx.attendance.findMany({
        where: {
          deviceUserId,
          date: dateOnly,
        },
        select: {
          checkType: true,
        },
      });

      const hasPunchIn = punches.some((p) => p.checkType === "PUNCHIN");
      const hasPunchOut = punches.some((p) => p.checkType === "PUNCHOUT");

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

    // Pre-adjust attendance checkTime for PUNCHIN based on shift day's grace and mark early overtime if needed
    let adjustedCheckTimeDate = checkTimeDate;
    let earlyOvertimeStart: Date | null = null;
    let earlyOvertimeEnd: Date | null = null;

    // Fetch employee and shift day to evaluate early punch-in
    const employee = await getEmployeeWithDetails(deviceUserId);
    let activeShift = employee?.employeeShifts?.[0];
    if (employee && activeShift && !isAbsent && finalCheckType === "PUNCHIN") {
      const cycleDayNumberAdj = getShiftCycleDayNumber(
        activeShift.startDate,
        dateOnly,
        activeShift.shift.cycleDays
      );
      const shiftDayAdj = await tx.shiftDay.findUnique({
        where: {
          shiftId_dayNumber: {
            shiftId: activeShift.shiftId,
            dayNumber: cycleDayNumberAdj,
          },
        },
      });
      if (shiftDayAdj) {
        const shiftStartAdj = new Date(shiftDayAdj.startTime);
        const sdGraceMsAdj = (shiftDayAdj.gracePeriod ?? 0) * 60 * 1000;
        const earlyThresholdAdj = new Date(shiftStartAdj.getTime() - sdGraceMsAdj);
        if (checkTimeDate < earlyThresholdAdj) {
          // Early before grace: create overtime from actual to shift start, and snap check-in to shift start
          earlyOvertimeStart = checkTimeDate;
          earlyOvertimeEnd = shiftStartAdj;
          adjustedCheckTimeDate = shiftStartAdj;
        } else if (checkTimeDate < shiftStartAdj) {
          // Within grace window: snap to shift start, no overtime
          adjustedCheckTimeDate = shiftStartAdj;
        }
      }
    }

    const attendanceData: any = {
      deviceUserId,
      date: dateOnly,
      checkTime: adjustedCheckTimeDate,
      checkType: finalCheckType,
      verifyMode,
      workCode,
      sensorId,
      deviceIp,
      isAbsent,
    };

    // Create attendance record
    const attendance = await tx.attendance.create({
      data: attendanceData,
    });

    // Employee context was loaded earlier
    if (!employee) {
      return attendance; // No employee found, just return attendance
    }

    // Check for holiday
    const holiday = await checkHoliday(employee.companyId, dateOnly);

    // Get active shift for the employee
    activeShift = employee.employeeShifts[0];

    // Get paired punches for overtime calculation
    const { punchIn, punchOut } = await getPairedPunches(
      deviceUserId,
      dateOnly
    );

    // Holiday overtime logic
    if (holiday) {
      const overtimeExists = await checkExistingOvertime(
        employee.id,
        dateOnly,
        "HOLIDAY_WORK"
      );

      if (!overtimeExists && (punchIn || punchOut)) {
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

    // Shift range overtime logic with company grace period
    if (activeShift && !isAbsent) {
      const cycleDayNumber = getShiftCycleDayNumber(
        activeShift.startDate,
        dateOnly,
        activeShift.shift.cycleDays
      );

      const shiftDay = await tx.shiftDay.findUnique({
        where: {
          shiftId_dayNumber: {
            shiftId: activeShift.shiftId,
            dayNumber: cycleDayNumber,
          },
        },
      });

      if (shiftDay) {
        const shiftStartTime = new Date(shiftDay.startTime);
        const shiftEndTime = new Date(shiftDay.endTime);

        // Use shift day's grace period (in minutes)
        const sdGraceMs = (shiftDay.gracePeriod ?? 0) * 60 * 1000;

        const earlyThreshold = new Date(
          shiftStartTime.getTime() - sdGraceMs
        );
        const lateThreshold = new Date(
          shiftEndTime.getTime() + sdGraceMs
        );

        // Early punch logic using shift day grace
        if (earlyOvertimeStart && earlyOvertimeEnd) {
          const overtimeExists = await checkExistingOvertime(
            employee.id,
            dateOnly,
            "UNSCHEDULED_WORK"
          );

          if (!overtimeExists) {
            await createOvertimeRecord(
              employee.id,
              dateOnly,
              earlyOvertimeStart,
              earlyOvertimeEnd,
              "UNSCHEDULED_WORK",
              "PENDING"
            );
          }
        }
        // Late punch logic (when punch-out is after shift end + shift grace)
        else if (
          finalCheckType === "PUNCHOUT" &&
          checkTimeDate > lateThreshold
        ) {
          const overtimeExists = await checkExistingOvertime(
            employee.id,
            dateOnly,
            "EXTENDED_SHIFT"
          );

          if (!overtimeExists) {
            const startTime = shiftEndTime;
            await createOvertimeRecord(
              employee.id,
              dateOnly,
              startTime,
              checkTimeDate,
              "EXTENDED_SHIFT",
              "PENDING"
            );
          }
        } else {
          // Within allowed time range (no overtime)
        }
      } else {
        console.log("❌ No shift day found for this date");
      }
    } else {
      console.log("❌ No active shift or employee is absent");
    }

    return attendance;
  });
};


const determineCheckType = async (
  deviceUserId: string,
  checkTime: Date
): Promise<"PUNCHIN" | "PUNCHOUT" | null> => {
  const dateOnly = new Date(checkTime.toDateString()); // gets YYYY-MM-DD

  // Get today's attendance records for this device user
  const todayRecords = await prisma.attendance.findMany({
    where: {
      deviceUserId,
      date: dateOnly,
      isAbsent: false,
    },
    orderBy: {
      checkTime: "asc",
    },
  });

  // Check existing punch types for the day
  const hasPunchIn = todayRecords.some(
    (record) => record.checkType === "PUNCHIN"
  );
  const hasPunchOut = todayRecords.some(
    (record) => record.checkType === "PUNCHOUT"
  );

  // If no records exist, first punch is PUNCHIN
  if (todayRecords.length === 0) {
    return "PUNCHIN";
  }

  // If has PUNCHIN but no PUNCHOUT, next should be PUNCHOUT
  if (hasPunchIn && !hasPunchOut) {
    return "PUNCHOUT";
  }

  // If no PUNCHIN yet (only PUNCHOUT exists somehow), next should be PUNCHIN
  if (!hasPunchIn && hasPunchOut) {
    return "PUNCHIN";
  }

  // If both PUNCHIN and PUNCHOUT already exist, return null (skip this record)
  if (hasPunchIn && hasPunchOut) {
    return null;
  }

  // Default fallback (shouldn't reach here)
  return "PUNCHIN";
};

const getAllAttendanceLogs = async () => {
  const today = new Date();
  const startOfDay = new Date(today.toDateString()); // 00:00:00
  const endOfDay = new Date(today.toDateString());
  endOfDay.setHours(23, 59, 59, 999); // 23:59:59.999

  const logs = await prisma.attendance.findMany({
    where: {
      checkTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    orderBy: [{ checkTime: "desc" }],
  });

  return await attachEmployeesToAttendance(logs);
};

const attachEmployeesToAttendance = async (logs: any[]) => {
  // Get unique deviceUserIds from the logs
  const deviceUserIds = [...new Set(logs.map((log) => log.deviceUserId))];

  // Find all matching employees by deviceUserId
  const employees = await prisma.employee.findMany({
    where: { deviceUserId: { in: deviceUserIds } },
    select: {
      id: true,
      name: true,
      username: true,
      deviceUserId: true,
    },
  });

  // Create a map for quick lookup
  const employeeMap = new Map(employees.map((emp) => [emp.deviceUserId, emp]));

  // Attach employee info to each log
  return logs.map((log) => ({
    ...log,
    employee: employeeMap.get(log.deviceUserId) || null,
  }));
};

const getAttendanceById = async (id: string) => {
  return prisma.attendance.findUnique({
    where: { id },
    // include: { employee: true },
  });
};

type AttendanceRecord = Awaited<ReturnType<typeof prisma.attendance.create>>;
type ErrorRecord = { error: string; data: CreateAttendanceData };

const bulkDeviceRegistration = async (dataArray: CreateAttendanceData[]) => {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Input must be a non-empty array"
    );
  }

  const processedRecords: AttendanceRecord[] = [];
  const errors: ErrorRecord[] = [];
  let overtimeRecordsCreated = 0;
  let skippedDuplicates = 0;

  await prisma.$transaction(async (tx) => {
    for (const data of dataArray) {
      try {
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

        // Use the shared parseTimestamp helper for consistency
        const checkTimeDate = parseTimestamp(checkTime);
        const dateOnly = date
          ? new Date(date + "T00:00:00Z")
          : new Date(checkTimeDate.toISOString().slice(0, 10) + "T00:00:00Z");

        // Check if this exact record already exists (prevent duplicates)
        const existingRecord = await tx.attendance.findFirst({
          where: {
            deviceUserId,
            checkTime: checkTimeDate,
            date: dateOnly,
          },
        });

        if (existingRecord) {
          skippedDuplicates++;
          continue;
        }

        // Count existing punches for this user & date
        const punchesCount = await tx.attendance.count({
          where: {
            deviceUserId,
            date: dateOnly,
          },
        });

        if (punchesCount >= 2) {
          skippedDuplicates++;
          continue;
        }

        // Determine checkType if not provided and not absent
        let finalCheckType = checkType;
        if (!finalCheckType && !isAbsent) {
          const determinedCheckType = await determineCheckType(
            deviceUserId,
            checkTimeDate
          );
          if (determinedCheckType === null) {
            // User already has both PUNCHIN and PUNCHOUT for the day
            skippedDuplicates++;
            continue;
          }
          finalCheckType = determinedCheckType;
        }

        const attendanceData: any = {
          deviceUserId,
          date: dateOnly,
          checkTime: checkTimeDate,
          checkType: finalCheckType,
          verifyMode,
          workCode,
          sensorId,
          deviceIp,
          isAbsent,
        };

        const attendance = await tx.attendance.create({
          data: attendanceData,
        });

        const employee = await getEmployeeWithDetails(deviceUserId);
        if (!employee) {
          processedRecords.push(attendance);
          continue;
        }

        const holiday = await checkHoliday(employee.companyId, dateOnly);
        const activeShift = employee.employeeShifts[0];
        const { punchIn, punchOut } = await getPairedPunches(
          deviceUserId,
          dateOnly
        );

        if (holiday) {
          const overtimeExists = await checkExistingOvertime(
            employee.id,
            dateOnly,
            "HOLIDAY_WORK"
          );
          if (!overtimeExists && (punchIn || punchOut)) {
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
            overtimeRecordsCreated++;
          }
        }

        if (activeShift && !isAbsent) {
          const shiftDay = await getShiftDayForDate(
            activeShift.shiftId,
            dateOnly,
            activeShift.shift.cycleDays
          );

          if (shiftDay) {
            const shiftStartTime = new Date(shiftDay.startTime);
            const shiftEndTime = new Date(shiftDay.endTime);

            // Get company-level overtime grace period (default to 0 if none found)
            const companyGracePeriodMinutes =
              await getActiveOvertimeGracePeriod(employee.companyId);
            const gracePeriodMs = companyGracePeriodMinutes * 60 * 1000;

            // Calculate allowed time boundaries with grace period
            const allowedStartTime = new Date(
              shiftStartTime.getTime() - gracePeriodMs
            );
            const allowedEndTime = new Date(
              shiftEndTime.getTime() + gracePeriodMs
            );

            if (checkTimeDate < allowedStartTime) {
              const overtimeExists = await checkExistingOvertime(
                employee.id,
                dateOnly,
                "UNSCHEDULED_WORK"
              );
              if (!overtimeExists) {
                const endTime =
                  punchOut?.checkTime ||
                  new Date(shiftStartTime.getTime() + gracePeriodMs);
                await createOvertimeRecord(
                  employee.id,
                  dateOnly,
                  checkTimeDate,
                  endTime,
                  "UNSCHEDULED_WORK",
                  "PENDING"
                );
                overtimeRecordsCreated++;
              }
            } else if (checkTimeDate > allowedEndTime) {
              const overtimeExists = await checkExistingOvertime(
                employee.id,
                dateOnly,
                "EXTENDED_SHIFT"
              );
              if (!overtimeExists) {
                const startTime =
                  punchIn?.checkTime ||
                  new Date(shiftEndTime.getTime() - gracePeriodMs);
                await createOvertimeRecord(
                  employee.id,
                  dateOnly,
                  startTime,
                  checkTimeDate,
                  "EXTENDED_SHIFT",
                  "PENDING"
                );
                overtimeRecordsCreated++;
              }
            }
          }
        }

        processedRecords.push(attendance);
      } catch (error: any) {
        errors.push({
          error: error.message || "Unknown error",
          data,
        });
      }
    }
  });

  return {
    success: errors.length === 0,
    totalRecords: dataArray.length,
    processedRecords: processedRecords.length,
    overtimeRecordsCreated,
    skippedDuplicates,
    errors: errors.length > 0 ? errors : undefined,
    data: processedRecords,
  };
};

const getAttendanceByDateRange = async (
  startDate: string,
  endDate: string,
  employeeId?: string
) => {
  const startDateObj = new Date(startDate + "T00:00:00.000Z");
  const endDateObj = new Date(endDate + "T23:59:59.999Z");

  const whereCondition: any = {
    date: {
      gte: startDateObj,
      lte: endDateObj,
    },
  };

  // If employeeId is provided, we need to find the deviceUserId first
  if (employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { deviceUserId: true },
    });

    if (!employee || !employee.deviceUserId) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Employee not found or doesn't have a device user ID"
      );
    }

    whereCondition.deviceUserId = employee.deviceUserId;
  }

  const logs = await prisma.attendance.findMany({
    where: whereCondition,
    orderBy: [{ date: "desc" }, { checkTime: "desc" }],
  });

  return await attachEmployeesToAttendance(logs);
};

const getAttendanceByDate = async (date: string, employeeId?: string) => {
  const dateObj = new Date(date + "T00:00:00.000Z");
  const endOfDay = new Date(date + "T23:59:59.999Z");

  const whereCondition: any = {
    date: {
      gte: dateObj,
      lte: endOfDay,
    },
  };

  // If employeeId is provided, we need to find the deviceUserId first
  if (employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { deviceUserId: true },
    });

    if (!employee || !employee.deviceUserId) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Employee not found or doesn't have a device user ID"
      );
    }

    whereCondition.deviceUserId = employee.deviceUserId;
  }

  const logs = await prisma.attendance.findMany({
    where: whereCondition,
    orderBy: [{ checkTime: "asc" }],
  });

  return await attachEmployeesToAttendance(logs);
};

// const getAttendanceSummary = async (
//   startDate: string,
//   endDate: string,
//   employeeId?: string
// ) => {
//   const startDateObj = new Date(startDate + "T00:00:00.000Z");
//   const endDateObj = new Date(endDate + "T23:59:59.999Z");

//   const whereCondition: any = {
//     date: {
//       gte: startDateObj,
//       lte: endDateObj,
//     },
//   };

//   // If employeeId is provided, filter by that employee
//   if (employeeId) {
//     const employee = await prisma.employee.findUnique({
//       where: { id: employeeId },
//       select: { deviceUserId: true },
//     });

//     if (!employee || !employee.deviceUserId) {
//       throw new ApiError(
//         httpStatus.NOT_FOUND,
//         "Employee not found or doesn't have a device user ID"
//       );
//     }

//     whereCondition.deviceUserId = employee.deviceUserId;
//   }

//   // Get all attendance records for the period
//   const allRecords = await prisma.attendance.findMany({
//     where: whereCondition,
//     select: {
//       deviceUserId: true,
//       date: true,
//       checkType: true,
//       checkTime: true,
//       isAbsent: true,
//     },
//     orderBy: [
//       { date: "asc" },
//       { checkTime: "asc" }
//     ],
//   });

//   // Group by date and deviceUserId to analyze daily attendance
//   const dailyAttendance = new Map();

//   allRecords.forEach(record => {
//     const dateKey = record.date.toISOString().split('T')[0];
//     const userKey = record.deviceUserId;
//     const combinedKey = `${dateKey}-${userKey}`;

//     if (!dailyAttendance.has(combinedKey)) {
//       dailyAttendance.set(combinedKey, {
//         date: dateKey,
//         deviceUserId: userKey,
//         punchIn: null,
//         punchOut: null,
//         isAbsent: record.isAbsent,
//         isComplete: false,
//       });
//     }

//     const dayRecord = dailyAttendance.get(combinedKey);

//     if (record.checkType === "PUNCHIN") {
//       dayRecord.punchIn = record.checkTime;
//     } else if (record.checkType === "PUNCHOUT") {
//       dayRecord.punchOut = record.checkTime;
//     }

//     // Mark as complete if has both punch in and out
//     dayRecord.isComplete = dayRecord.punchIn && dayRecord.punchOut;
//   });

//   const dailyRecords = Array.from(dailyAttendance.values());

//   // Calculate statistics
//   const totalDays = dailyRecords.length;
//   const completeDays = dailyRecords.filter(day => day.isComplete).length;
//   const incompleteDays = dailyRecords.filter(day => !day.isComplete && !day.isAbsent).length;
//   const absentDays = dailyRecords.filter(day => day.isAbsent).length;
//   const uniqueEmployees = new Set(allRecords.map(r => r.deviceUserId)).size;

//   return {
//     dateRange: {
//       startDate,
//       endDate,
//     },
//     summary: {
//       totalRecords: allRecords.length,
//       totalDays: totalDays,
//       completeDays: completeDays,
//       incompleteDays: incompleteDays,
//       absentDays: absentDays,
//       uniqueEmployees: uniqueEmployees,
//       completionRate: totalDays > 0 ? ((completeDays / totalDays) * 100).toFixed(2) + '%' : '0%',
//     },
//     dailyBreakdown: dailyRecords,
//   };
// };

// const getAttendanceSummary = async (
//   startDate: string,
//   endDate: string,
//   employeeId?: string
// ) => {
//   const startDateObj = new Date(`${startDate}T00:00:00.000Z`);
//   const endDateObj = new Date(`${endDate}T23:59:59.999Z`);

//   const whereCondition: any = {
//     date: {
//       gte: startDateObj,
//       lte: endDateObj,
//     },
//   };

//   // If employeeId is provided, map to deviceUserId
//   if (employeeId) {
//     const employee = await prisma.employee.findUnique({
//       where: { id: employeeId },
//       select: { deviceUserId: true },
//     });

//     if (!employee || !employee.deviceUserId) {
//       throw new ApiError(
//         httpStatus.NOT_FOUND,
//         "Employee not found or doesn't have a device user ID"
//       );
//     }

//     whereCondition.deviceUserId = employee.deviceUserId;
//   }

//   // Fetch all attendance records in range
//   const allRecords = await prisma.attendance.findMany({
//     where: whereCondition,
//     select: {
//       deviceUserId: true,
//       date: true,
//       checkType: true,
//       checkTime: true,
//       isAbsent: true,
//     },
//     orderBy: [{ deviceUserId: "asc" }, { date: "asc" }, { checkTime: "asc" }],
//   });

//   // Group and summarize per day
//   const summary: Record<string, any> = {};

//   for (const record of allRecords) {
//     const key = `${record.deviceUserId}_${
//       record.date.toISOString().split("T")[0]
//     }`;

//     if (!summary[key]) {
//       summary[key] = {
//         deviceUserId: record.deviceUserId,
//         date: record.date,
//         checkIn: null,
//         checkOut: null,
//         totalHours: 0,
//         isAbsent: false,
//         records: [],
//       };
//     }

//     summary[key].records.push(record);

//     if (record.isAbsent) {
//       summary[key].isAbsent = true;
//     } else if (record.checkType === "PUNCHIN") {
//       summary[key].checkIn ??= record.checkTime;
//     } else if (record.checkType === "PUNCHOUT") {
//       summary[key].checkOut = record.checkTime;
//     }

//     // Calculate totalHours if both checkIn and checkOut exist
//     const { checkIn, checkOut } = summary[key];
//     if (checkIn && checkOut) {
//       summary[key].totalHours =
//         (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
//         (1000 * 60 * 60);
//     }
//   }

//   // Return an array of daily summaries
//   return Object.values(summary);
// };
const getAttendanceSummary = async (
  startDate: string,
  endDate: string,
  employeeId?: string
) => {
  const startDateObj = new Date(`${startDate}T00:00:00.000Z`);
  const endDateObj = new Date(`${endDate}T23:59:59.999Z`);

  const whereCondition: any = {
    date: {
      gte: startDateObj,
      lte: endDateObj,
    },
  };

  let deviceUserIdMap: Record<string, { id: string; name: string }> = {};

  // If employeeId is provided, map to deviceUserId
  if (employeeId) {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { deviceUserId: true, id: true, name: true },
    });

    if (!employee || !employee.deviceUserId) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Employee not found or doesn't have a device user ID"
      );
    }

    whereCondition.deviceUserId = employee.deviceUserId;
    deviceUserIdMap[employee.deviceUserId] = {
      id: employee.id,
      name: employee.name,
    };
  } else {
    // Preload all deviceUserId mappings for the entire company
    const employees = await prisma.employee.findMany({
      select: { deviceUserId: true, id: true, name: true },
      where: { deviceUserId: { not: null } },
    });

    for (const emp of employees) {
      if (emp.deviceUserId) {
        deviceUserIdMap[emp.deviceUserId] = {
          id: emp.id,
          name: emp.name,
        };
      }
    }
  }

  const allRecords = await prisma.attendance.findMany({
    where: whereCondition,
    select: {
      deviceUserId: true,
      date: true,
      checkType: true,
      checkTime: true,
      isAbsent: true,
    },
    orderBy: [{ deviceUserId: "asc" }, { date: "asc" }, { checkTime: "asc" }],
  });

  const summary: Record<string, any> = {};

  for (const record of allRecords) {
    const key = `${record.deviceUserId}_${
      record.date.toISOString().split("T")[0]
    }`;
    const employee = deviceUserIdMap[record.deviceUserId];

    if (!summary[key]) {
      summary[key] = {
        deviceUserId: record.deviceUserId,
        employeeId: employee?.id ?? null,
        employeeName: employee?.name ?? null,
        date: record.date,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        isAbsent: false,
        records: [],
      };
    }

    summary[key].records.push(record);

    if (record.isAbsent) {
      summary[key].isAbsent = true;
    } else if (record.checkType === "PUNCHIN") {
      summary[key].checkIn ??= record.checkTime;
    } else if (record.checkType === "PUNCHOUT") {
      summary[key].checkOut = record.checkTime;
    }

    const { checkIn, checkOut } = summary[key];
    if (checkIn && checkOut) {
      summary[key].totalHours =
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60);
    }
  }

  return Object.values(summary);
};

const getTodaysAttendance = async () => {
  const today = new Date();
  const dateOnly = new Date(
    today.toISOString().split("T")[0] + "T00:00:00.000Z"
  );

  // Preload all employees with deviceUserId
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
    },
    where: {
      deviceUserId: { not: null },
    },
  });

  const deviceUserIdMap: Record<string, { id: string; name: string }> = {};
  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
      };
    }
  }

  // Get today's attendance logs
  const records = await prisma.attendance.findMany({
    where: {
      date: dateOnly,
    },
    select: {
      deviceUserId: true,
      checkType: true,
      checkTime: true,
      isAbsent: true,
    },
    orderBy: {
      checkTime: "asc",
    },
  });

  // Group by deviceUserId + summarize
  const summary: Record<string, any> = {};

  for (const record of records) {
    const empInfo = deviceUserIdMap[record.deviceUserId];
    if (!empInfo) continue;

    const key = record.deviceUserId;

    if (!summary[key]) {
      summary[key] = {
        employeeId: empInfo.id,
        employeeName: empInfo.name,
        deviceUserId: record.deviceUserId,
        date: dateOnly,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        isAbsent: false,
        records: [],
      };
    }

    summary[key].records.push(record);

    if (record.isAbsent) {
      summary[key].isAbsent = true;
    } else if (record.checkType === "PUNCHIN") {
      summary[key].checkIn ??= record.checkTime;
    } else if (record.checkType === "PUNCHOUT") {
      summary[key].checkOut = record.checkTime;
    }

    const { checkIn, checkOut } = summary[key];
    if (checkIn && checkOut) {
      summary[key].totalHours =
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60);
    }
  }

  return Object.values(summary);
};
const getWeeklyAttendance = async () => {
  // Get today's date in UTC
  const today = new Date();

  // Calculate current week's Monday (start of week)
  const dayOfWeek = today.getUTCDay(); // Sunday=0, Monday=1, ..., Saturday=6
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), treat as 7th day of previous week

  // Monday at 00:00:00 UTC
  const monday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - diffToMonday,
      0,
      0,
      0
    )
  );

  // Sunday at 23:59:59.999 UTC
  const sunday = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + (7 - diffToMonday) - 1,
      23,
      59,
      59,
      999
    )
  );

  // Preload employees with deviceUserId
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
    },
    where: {
      deviceUserId: { not: null },
    },
  });

  const deviceUserIdMap: Record<string, { id: string; name: string }> = {};
  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
      };
    }
  }

  // Get attendance records in the current week
  const records = await prisma.attendance.findMany({
    where: {
      date: {
        gte: monday,
        lte: sunday,
      },
    },
    select: {
      deviceUserId: true,
      date: true,
      checkType: true,
      checkTime: true,
      isAbsent: true,
    },
    orderBy: [{ deviceUserId: "asc" }, { date: "asc" }, { checkTime: "asc" }],
  });

  // Group by deviceUserId and date (daily summary per employee)
  const summary: Record<string, any> = {};

  for (const record of records) {
    const empInfo = deviceUserIdMap[record.deviceUserId];
    if (!empInfo) continue;

    // Key includes deviceUserId and date (yyyy-mm-dd)
    const day = record.date.toISOString().split("T")[0];
    const key = `${record.deviceUserId}_${day}`;

    if (!summary[key]) {
      summary[key] = {
        employeeId: empInfo.id,
        employeeName: empInfo.name,
        deviceUserId: record.deviceUserId,
        date: record.date,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        isAbsent: false,
        records: [],
      };
    }

    summary[key].records.push(record);

    if (record.isAbsent) {
      summary[key].isAbsent = true;
    } else if (record.checkType === "PUNCHIN") {
      summary[key].checkIn ??= record.checkTime;
    } else if (record.checkType === "PUNCHOUT") {
      summary[key].checkOut = record.checkTime;
    }

    const { checkIn, checkOut } = summary[key];
    if (checkIn && checkOut) {
      summary[key].totalHours =
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60);
    }
  }

  // Return array of daily attendance summaries for the current week
  return Object.values(summary);
};
const getMonthlyAttendance = async () => {
  const today = new Date();

  // First day of the current month at 00:00:00 UTC
  const firstDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 0, 0, 0)
  );

  // Last day of the current month at 23:59:59.999 UTC
  const lastDay = new Date(
    Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth() + 1,
      0,
      23,
      59,
      59,
      999
    )
  );

  // Preload employees with deviceUserId
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
    },
    where: {
      deviceUserId: { not: null },
    },
  });

  const deviceUserIdMap: Record<string, { id: string; name: string }> = {};
  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
      };
    }
  }

  // Get attendance records in the current month
  const records = await prisma.attendance.findMany({
    where: {
      date: {
        gte: firstDay,
        lte: lastDay,
      },
    },
    select: {
      deviceUserId: true,
      date: true,
      checkType: true,
      checkTime: true,
      isAbsent: true,
    },
    orderBy: [{ deviceUserId: "asc" }, { date: "asc" }, { checkTime: "asc" }],
  });

  // Group by deviceUserId and date (daily summary per employee)
  const summary: Record<string, any> = {};

  for (const record of records) {
    const empInfo = deviceUserIdMap[record.deviceUserId];
    if (!empInfo) continue;

    const day = record.date.toISOString().split("T")[0];
    const key = `${record.deviceUserId}_${day}`;

    if (!summary[key]) {
      summary[key] = {
        employeeId: empInfo.id,
        employeeName: empInfo.name,
        deviceUserId: record.deviceUserId,
        date: record.date,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        isAbsent: false,
        records: [],
      };
    }

    summary[key].records.push(record);

    if (record.isAbsent) {
      summary[key].isAbsent = true;
    } else if (record.checkType === "PUNCHIN") {
      summary[key].checkIn ??= record.checkTime;
    } else if (record.checkType === "PUNCHOUT") {
      summary[key].checkOut = record.checkTime;
    }

    const { checkIn, checkOut } = summary[key];
    if (checkIn && checkOut) {
      summary[key].totalHours =
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60);
    }
  }

  return Object.values(summary);
};
const getYearlyAttendance = async () => {
  const today = new Date();

  // First day of the current year at 00:00:00 UTC
  const firstDay = new Date(Date.UTC(today.getUTCFullYear(), 0, 1, 0, 0, 0));

  // Last day of the current year at 23:59:59.999 UTC
  const lastDay = new Date(
    Date.UTC(today.getUTCFullYear(), 11, 31, 23, 59, 59, 999)
  );

  // Preload employees with deviceUserId
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
    },
    where: {
      deviceUserId: { not: null },
    },
  });

  const deviceUserIdMap: Record<string, { id: string; name: string }> = {};
  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
      };
    }
  }

  // Get attendance records in the current year
  const records = await prisma.attendance.findMany({
    where: {
      date: {
        gte: firstDay,
        lte: lastDay,
      },
    },
    select: {
      deviceUserId: true,
      date: true,
      checkType: true,
      checkTime: true,
      isAbsent: true,
    },
    orderBy: [{ deviceUserId: "asc" }, { date: "asc" }, { checkTime: "asc" }],
  });

  // Group by deviceUserId and date (daily summary per employee)
  const summary: Record<string, any> = {};

  for (const record of records) {
    const empInfo = deviceUserIdMap[record.deviceUserId];
    if (!empInfo) continue;

    const day = record.date.toISOString().split("T")[0];
    const key = `${record.deviceUserId}_${day}`;

    if (!summary[key]) {
      summary[key] = {
        employeeId: empInfo.id,
        employeeName: empInfo.name,
        deviceUserId: record.deviceUserId,
        date: record.date,
        checkIn: null,
        checkOut: null,
        totalHours: 0,
        isAbsent: false,
        records: [],
      };
    }

    summary[key].records.push(record);

    if (record.isAbsent) {
      summary[key].isAbsent = true;
    } else if (record.checkType === "PUNCHIN") {
      summary[key].checkIn ??= record.checkTime;
    } else if (record.checkType === "PUNCHOUT") {
      summary[key].checkOut = record.checkTime;
    }

    const { checkIn, checkOut } = summary[key];
    if (checkIn && checkOut) {
      summary[key].totalHours =
        (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
        (1000 * 60 * 60);
    }
  }

  return Object.values(summary);
};

const updateAttendanceTimestamp = async (id: string, checkTime: string) => {
  const attendance = await prisma.attendance.findUnique({ where: { id } });

  if (!attendance) {
    throw new ApiError(httpStatus.NOT_FOUND, "Attendance record not found");
  }

  let newCheckTime: Date;
  try {
    newCheckTime = parseTimestamp(checkTime);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid checkTime format");
  }

  // If the new checkTime is same as the old one, no update needed
  if (newCheckTime.getTime() === new Date(attendance.checkTime).getTime()) {
    return attendance; // return existing without updating
  }

  // Update checkTime and keep date synced with checkTime's date
  const updated = await prisma.attendance.update({
    where: { id },
    data: {
      checkTime: newCheckTime,
      date: new Date(newCheckTime.toDateString()),
    },
  });

  return updated;
};

// const updateAttendanceTimestamp = async (id: string, checkTime: string) => {
//   const attendance = await prisma.attendance.findUnique({ where: { id } });

//   if (!attendance) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Attendance record not found");
//   }

//   const newCheckTime = new Date(checkTime);
//   if (isNaN(newCheckTime.getTime())) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid checkTime format");
//   }

//   // Update checkTime (and optionally date to match checkTime's date)
//   const updated = await prisma.attendance.update({
//     where: { id },
//     data: {
//       checkTime: newCheckTime,
//       date: new Date(newCheckTime.toDateString()), // keep date synced with checkTime's date
//     },
//   });

//   return updated;
// };

export default {
  createAttendance,
  getAllAttendanceLogs,
  getAttendanceById,
  bulkDeviceRegistration,
  getAttendanceByDateRange,
  getAttendanceByDate,
  getAttendanceSummary,
  getTodaysAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getYearlyAttendance,
  updateAttendanceTimestamp,
  // New overtime grace period functions
  getActiveOvertimeGracePeriod,
  isOvertimeWithGracePeriod,
  checkOvertimeWithCompanyGracePeriod,
};
