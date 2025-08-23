import prisma from "../../client";
import {
  UpdateWorkSessionRequest,
  IWorkSessionWithRelations,
} from "./updatedAttendance.type";
import {
  formatTime,
  calculateDurationMinutes,
  createStableDateTime,
  normalizePunchTimesToShift,
  getCompanyGracePeriod,
  addGracePeriod,
  subtractGracePeriod,
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
    return parsed;
  }

  // If it's just time (HH:MM:SS), combine with today's date
  if (dateTimeStr.match(/^\d{2}:\d{2}:\d{2}$/)) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const combined = `${today}T${dateTimeStr}`;
    const parsed = new Date(combined);
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

// Helper function to get work session by ID
const getWorkSessionById = async (
  id: string
): Promise<IWorkSessionWithRelations> => {
  const workSession = await prisma.workSession.findUnique({
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
    throw new Error(`Work session with ID ${id} not found`);
  }

  // Type assertion to handle the nullable punchOut field
  return workSession as IWorkSessionWithRelations;
};

// Overtime processing functions (simplified versions for update)
const processRotationOvertime = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  punchIn: Date,
  punchOut: Date
) => {
  console.log("Processing rotation overtime for update");
  // For now, we'll create basic overtime records
  // This can be enhanced later with full rotation logic

  // Create early arrival overtime if punch-in is before shift start
  // Create late departure overtime if punch-out is after shift end
  // This is a simplified version - the full logic is in the main service
};

const processOvertimeLogic = async (
  workSessionId: string,
  deviceUserId: string,
  date: Date,
  punchIn: Date,
  punchOut: Date,
  shiftId: string
) => {
  console.log("Processing FIXED_WEEKLY overtime for update");

  // Get shift information
  const shift = await getShiftInfo(shiftId, date);
  if (!shift || !shift.patternDays.length) {
    console.log("No shift pattern found for overtime calculation");
    return;
  }

  const shiftDay = shift.patternDays[0];

  // Create shift times on the work date
  const workDateStr = date.toISOString().split("T")[0];
  const shiftStartTimeStr = formatTime(new Date(shiftDay.startTime));
  const shiftEndTimeStr = formatTime(new Date(shiftDay.endTime));

  if (!shiftStartTimeStr || !shiftEndTimeStr) {
    console.log("Invalid shift times found");
    return;
  }

  const shiftStartTime = createStableDateTime(workDateStr, shiftStartTimeStr);
  const shiftEndTime = createStableDateTime(workDateStr, shiftEndTimeStr);

  // Get employee info for company grace period
  const employee = await prisma.employee.findFirst({
    where: { deviceUserId },
    select: { companyId: true },
  });

  // Get company grace period
  const companyGracePeriodMinutes = await getCompanyGracePeriod(
    employee?.companyId || "",
    prisma
  );
  const effectiveGracePeriod = companyGracePeriodMinutes || 0;

  // Calculate grace boundaries
  const earlyThreshold = subtractGracePeriod(
    shiftStartTime,
    effectiveGracePeriod
  );
  const lateThreshold = addGracePeriod(shiftEndTime, effectiveGracePeriod);

  console.log(
    `Processing overtime with grace period: ${effectiveGracePeriod} minutes`
  );
  console.log(
    `Shift times: ${formatTime(shiftStartTime)} - ${formatTime(shiftEndTime)}`
  );
  console.log(`Punch times: ${formatTime(punchIn)} - ${formatTime(punchOut)}`);
  console.log(
    `Early threshold: ${formatTime(
      earlyThreshold
    )}, Late threshold: ${formatTime(lateThreshold)}`
  );

  // Check for early arrival overtime (only if beyond grace period)
  if (punchIn < earlyThreshold) {
    const overtimeMinutes = calculateDuration(punchIn, shiftStartTime);
    console.log(
      `✅ Creating early arrival overtime: ${overtimeMinutes} minutes`
    );

    await (prisma as any).overtimeTable.create({
      data: {
        workSessionId,
        deviceUserId,
        date,
        punchIn,
        punchOut: shiftStartTime,
        type: "EARLY_ARRIVAL",
        status: "PENDING",
        punchInSource: "manual",
        punchOutSource: "manual",
      },
    });
  } else {
    console.log(
      `❌ No early arrival overtime - punch in ${formatTime(
        punchIn
      )} is not before ${formatTime(earlyThreshold)}`
    );
  }

  // Check for late departure overtime (only if beyond grace period)
  if (punchOut > lateThreshold) {
    const overtimeMinutes = calculateDuration(shiftEndTime, punchOut);
    console.log(
      `✅ Creating late departure overtime: ${overtimeMinutes} minutes`
    );

    await (prisma as any).overtimeTable.create({
      data: {
        workSessionId,
        deviceUserId,
        date,
        punchIn: shiftEndTime,
        punchOut,
        type: "LATE_DEPARTURE",
        status: "PENDING",
        punchInSource: "manual",
        punchOutSource: "manual",
      },
    });
  } else {
    console.log(
      `❌ No late departure overtime - punch out ${formatTime(
        punchOut
      )} is not after ${formatTime(lateThreshold)}`
    );
  }
};

// const updateWorkSession = async (
//   id: string,
//   data: UpdateWorkSessionRequest
// ): Promise<IWorkSessionWithRelations> => {
const updateWorkSession = async (
  id: string,
  data: UpdateWorkSessionRequest
): Promise<IWorkSessionWithRelations | undefined> => {
  const workSession = await getWorkSessionById(id);

  const updateData: any = {};

  // Store ACTUAL punch times BEFORE any normalization for calculations
  let actualPunchInForCalculations = null;
  let actualPunchOutForCalculations = null;

  // Parse actual input times (before normalization)
  if (data.punchIn !== undefined) {
    if (data.punchIn === null || data.punchIn === "") {
      actualPunchInForCalculations = null;
      updateData.punchIn = null;
    } else if (
      typeof data.punchIn === "string" &&
      data.punchIn.match(/^\d{2}:\d{2}:\d{2}$/)
    ) {
      console.log(
        `Converting update punchIn time-only string: ${data.punchIn}`
      );
      const workSessionDateStr = workSession.date.toISOString().split("T")[0];
      actualPunchInForCalculations = createStableDateTime(
        workSessionDateStr,
        data.punchIn
      );
      updateData.punchIn = actualPunchInForCalculations; // Store actual time initially
      console.log(
        `Converted update punchIn: ${actualPunchInForCalculations.toISOString()}`
      );
    } else {
      actualPunchInForCalculations = parseDateTime(data.punchIn);
      updateData.punchIn = actualPunchInForCalculations;
    }
  } else {
    actualPunchInForCalculations = workSession.punchIn;
  }

  if (data.punchOut !== undefined) {
    if (data.punchOut === null || data.punchOut === "") {
      actualPunchOutForCalculations = null;
      updateData.punchOut = null;
    } else if (
      typeof data.punchOut === "string" &&
      data.punchOut.match(/^\d{2}:\d{2}:\d{2}$/)
    ) {
      console.log(
        `Converting update punchOut time-only string: ${data.punchOut}`
      );
      const workSessionDateStr = workSession.date.toISOString().split("T")[0];
      actualPunchOutForCalculations = createStableDateTime(
        workSessionDateStr,
        data.punchOut
      );
      updateData.punchOut = actualPunchOutForCalculations; // Store actual time initially
      console.log(
        `Converted update punchOut: ${actualPunchOutForCalculations.toISOString()}`
      );
    } else {
      actualPunchOutForCalculations = parseDateTime(data.punchOut);
      updateData.punchOut = actualPunchOutForCalculations;
    }
  } else {
    actualPunchOutForCalculations = workSession.punchOut;
  }

  console.log("=== ACTUAL Times for Calculations ===");
  console.log(
    "Actual punch in for calculations:",
    formatTime(actualPunchInForCalculations)
  );
  console.log(
    "Actual punch out for calculations:",
    formatTime(actualPunchOutForCalculations)
  );

  // Handle other fields
  if (data.punchInSource !== undefined) {
    updateData.punchInSource = data.punchInSource;
  }

  if (data.punchOutSource !== undefined) {
    updateData.punchOutSource = data.punchOutSource;
  }

  if (data.shiftId !== undefined) {
    updateData.shiftId = data.shiftId;
  }

  // Calculate duration using ACTUAL times (not normalized)
  if (actualPunchInForCalculations && actualPunchOutForCalculations) {
    updateData.duration = calculateDuration(
      actualPunchInForCalculations,
      actualPunchOutForCalculations
    );
    console.log("=== Duration Calculation (ACTUAL TIMES) ===");
    console.log("Actual punch in:", formatTime(actualPunchInForCalculations));
    console.log("Actual punch out:", formatTime(actualPunchOutForCalculations));
    console.log("Actual duration (minutes):", updateData.duration);
  }

  // Calculate early/late minutes using ACTUAL times vs shift times
  if (actualPunchInForCalculations && actualPunchOutForCalculations) {
    const finalShiftId = updateData.shiftId || workSession.shiftId;
    if (finalShiftId) {
      const shift = await getShiftInfo(finalShiftId, workSession.date);
      if (shift && shift.patternDays.length > 0) {
        const shiftDay = shift.patternDays[0];

        // Create shift times on the work date
        const workDateStr = workSession.date.toISOString().split("T")[0];
        const shiftStartTimeStr = formatTime(new Date(shiftDay.startTime));
        const shiftEndTimeStr = formatTime(new Date(shiftDay.endTime));

        if (!shiftStartTimeStr || !shiftEndTimeStr) {
          console.log("Invalid shift times found for early/late calculation");
          return;
        }

        const shiftStartTime = createStableDateTime(
          workDateStr,
          shiftStartTimeStr
        );
        const shiftEndTime = createStableDateTime(workDateStr, shiftEndTimeStr);

        updateData.earlyMinutes = 0;
        updateData.lateMinutes = 0;

        // Early arrival: actual punch-in before shift start
        if (actualPunchInForCalculations < shiftStartTime) {
          updateData.earlyMinutes = Math.round(
            (shiftStartTime.getTime() -
              actualPunchInForCalculations.getTime()) /
              (1000 * 60)
          );
        }

        // Late departure: actual punch-out after shift end
        if (actualPunchOutForCalculations > shiftEndTime) {
          updateData.lateMinutes = Math.round(
            (actualPunchOutForCalculations.getTime() - shiftEndTime.getTime()) /
              (1000 * 60)
          );
        }

        console.log("=== Early/Late Minutes (ACTUAL TIMES) ===");
        console.log("Shift start:", formatTime(shiftStartTime));
        console.log("Shift end:", formatTime(shiftEndTime));
        console.log(
          "Actual punch in:",
          formatTime(actualPunchInForCalculations)
        );
        console.log(
          "Actual punch out:",
          formatTime(actualPunchOutForCalculations)
        );
        console.log("Early minutes:", updateData.earlyMinutes);
        console.log("Late minutes:", updateData.lateMinutes);
      }
    }
  }

  // Calculate deductible minutes using ACTUAL times
  if (actualPunchInForCalculations && actualPunchOutForCalculations) {
    const finalShiftId = updateData.shiftId || workSession.shiftId;
    if (finalShiftId) {
      // Get employee shift info
      const employee = await prisma.employee.findFirst({
        where: { deviceUserId: workSession.deviceUserId },
        include: {
          employeeShifts: {
            where: { isActive: true },
            include: {
              shift: {
                select: {
                  id: true,
                  shiftType: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      if (employee && employee.employeeShifts.length > 0) {
        const activeShift = employee.employeeShifts[0];

        // Get shift day info for deductible calculations
        const dateObj = new Date(workSession.date);
        const jsDay = dateObj.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayNumber = jsDay === 0 ? 7 : jsDay; // Convert to 1-7 format (1 = Monday, 7 = Sunday)

        const shiftDay = await prisma.shiftDay.findFirst({
          where: {
            shiftId: finalShiftId,
            dayNumber: dayNumber,
          },
        });

        if (shiftDay) {
          // Start with break time
          let dedutedMinutes = shiftDay.breakTime || 0;

          // For FIXED_WEEKLY shifts, add attendance penalties (late arrival + early departure)
          if (activeShift.shift.shiftType === "FIXED_WEEKLY") {
            const gracePeriodMinutes = shiftDay.gracePeriod || 0;

            // Extract time strings from shift DateTime objects and create them on the work date
            const shiftStartTimeStr = formatTime(new Date(shiftDay.startTime));
            const shiftEndTimeStr = formatTime(new Date(shiftDay.endTime));

            if (shiftStartTimeStr && shiftEndTimeStr) {
              const workDateStr = workSession.date.toISOString().split("T")[0];
              const shiftStartTime = createStableDateTime(
                workDateStr,
                shiftStartTimeStr
              );
              const shiftEndTime = createStableDateTime(
                workDateStr,
                shiftEndTimeStr
              );

              // Calculate late arrival penalty (beyond grace period)
              if (actualPunchInForCalculations > shiftStartTime) {
                const lateArrivalMinutes = Math.round(
                  (actualPunchInForCalculations.getTime() -
                    shiftStartTime.getTime()) /
                    (1000 * 60)
                );
                // Only count as deductible if beyond grace period
                if (lateArrivalMinutes > gracePeriodMinutes) {
                  dedutedMinutes += lateArrivalMinutes - gracePeriodMinutes;
                }
              }

              // Calculate early departure penalty (beyond grace period)
              if (actualPunchOutForCalculations < shiftEndTime) {
                const earlyDepartureMinutes = Math.round(
                  (shiftEndTime.getTime() -
                    actualPunchOutForCalculations.getTime()) /
                    (1000 * 60)
                );
                // Only count as deductible if beyond grace period
                if (earlyDepartureMinutes > gracePeriodMinutes) {
                  dedutedMinutes += earlyDepartureMinutes - gracePeriodMinutes;
                }
              }

              console.log(
                "=== Deductible Minutes Calculation (ACTUAL TIMES) ==="
              );
              console.log("Break time:", shiftDay.breakTime || 0);
              console.log("Grace period:", gracePeriodMinutes);
              console.log("Shift start:", formatTime(shiftStartTime));
              console.log("Shift end:", formatTime(shiftEndTime));
              console.log(
                "Actual punch in:",
                formatTime(actualPunchInForCalculations)
              );
              console.log(
                "Actual punch out:",
                formatTime(actualPunchOutForCalculations)
              );
              console.log("Total deductible minutes:", dedutedMinutes);
            }
          }

          updateData.dedutedMinutes = dedutedMinutes;
        }
      }
    }
  }

  // Process overtime using ACTUAL times (before normalization)
  if (actualPunchInForCalculations && actualPunchOutForCalculations) {
    const finalShiftId = updateData.shiftId || workSession.shiftId;
    if (finalShiftId) {
      // Get employee shift info
      const employee = await prisma.employee.findFirst({
        where: { deviceUserId: workSession.deviceUserId },
        include: {
          employeeShifts: {
            where: { isActive: true },
            include: {
              shift: {
                select: {
                  id: true,
                  shiftType: true,
                },
              },
            },
            take: 1,
          },
        },
      });

      if (employee && employee.employeeShifts.length > 0) {
        const activeShift = employee.employeeShifts[0];

        console.log("=== Processing Overtime (ACTUAL TIMES) ===");

        // Delete existing overtime records for this session
        await (prisma as any).overtimeTable.deleteMany({
          where: { workSessionId: id },
        });

        // Process overtime using ACTUAL punch times
        if (activeShift.shift.shiftType === "ROTATING") {
          console.log("🔄 Processing ROTATION shift overtime");
          await processRotationOvertime(
            id,
            workSession.deviceUserId,
            workSession.date,
            actualPunchInForCalculations,
            actualPunchOutForCalculations
          );
        } else {
          console.log("📅 Processing FIXED_WEEKLY shift overtime");
          await processOvertimeLogic(
            id,
            workSession.deviceUserId,
            workSession.date,
            actualPunchInForCalculations,
            actualPunchOutForCalculations,
            finalShiftId
          );
        }
      }
    }
  }

  // Normalize punch times for display ONLY (after all calculations are done)
  if (updateData.punchIn || updateData.punchOut) {
    const finalPunchIn = updateData.punchIn || workSession.punchIn;
    const finalPunchOut = updateData.punchOut || workSession.punchOut;
    const finalShiftId = updateData.shiftId || workSession.shiftId;

    if (finalShiftId && (finalPunchIn || finalPunchOut)) {
      console.log("=== Normalizing Times for Display ===");
      const normalizationResult = await normalizePunchTimesToShift(
        finalPunchIn,
        finalPunchOut,
        finalShiftId,
        workSession.date,
        prisma
      );

      // Update with normalized times for display
      if (updateData.punchIn !== undefined) {
        updateData.punchIn = normalizationResult.normalizedPunchIn;
      }
      if (updateData.punchOut !== undefined) {
        updateData.punchOut = normalizationResult.normalizedPunchOut;
      }

      console.log(
        "Normalized punch in for display:",
        formatTime(updateData.punchIn)
      );
      console.log(
        "Normalized punch out for display:",
        formatTime(updateData.punchOut)
      );
    }
  }

  // Update the database with normalized display times
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

  // Get the updated work session
  const result = await getWorkSessionById(id);

  // Transform the response to return HH:MM:SS format for punch times
  const transformedResult = {
    ...result,
    punchIn: result.punchIn ? formatTime(result.punchIn) : null,
    punchOut: result.punchOut ? formatTime(result.punchOut) : null,
  };

  return transformedResult as IWorkSessionWithRelations;
};

export default { updateWorkSession };
