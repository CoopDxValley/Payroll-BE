import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import prisma from "../../client";
import { createPayrollInput, employeeForPayrollInclude } from "./payroll.type";
import payrollUtil from "./payroll.util";
import { start } from "repl";
import payrolldefinitionService from "../payrolldefinition/payrolldefinition.service";
// Interface for attendance-based payroll calculation
interface AttendancePayrollData {
  employeeId: string;
  payrollDefinitionId: string;
  expectedHours: number;
  actualHours: number;
  attendanceRate: number; // percentage
  adjustedBasicSalary: number; // Basic salary adjusted for attendance
}

// Helper function to get working days in date range (only working days, ignore holidays)
const getWorkingDaysInRange = async (
  startDate: Date,
  endDate: Date,
  companyId: string
): Promise<{ workingDays: Date[] }> => {
  const workingCalendar = await prisma.workingCalendar.findMany({
    where: {
      companyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      isActive: true,
      dayType: "WORKING_DAY", // Only get working days
    },
  });
  console.log("gemememeeeemememe");
  console.log(workingCalendar);
  const workingDays = workingCalendar.map((cal) => cal.date);

  return { workingDays };
};

// Helper function to calculate expected hours for FIXED_WEEKLY shift
const calculateExpectedHoursFixedWeekly = async (
  employeeId: string,
  startDate: Date,
  endDate: Date,
  companyId: string
): Promise<{ expectedHours: number; shiftDays: any[] }> => {
  // Get employee shift
  const employeeShift = await prisma.employeeShift.findFirst({
    where: { employeeId },
    include: {
      shift: {
        include: {
          patternDays: true,
        },
      },
    },
  });

  if (!employeeShift || employeeShift.shift.shiftType !== "FIXED_WEEKLY") {
    return { expectedHours: 0, shiftDays: [] };
  }

  const shiftDays = employeeShift.shift.patternDays;

  // Get working calendar to check for holidays
  const workingCalendar = await prisma.workingCalendar.findMany({
    where: {
      companyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      isActive: true,
    },
  });

  // Create a set of holiday dates for fast lookup
  const holidayDates = new Set(
    workingCalendar
      .filter((cal) => cal.dayType === "HOLIDAY")
      .map((cal) => cal.date.toDateString())
  );

  // Count how many of each day of the week occur in the date range (excluding holidays and rest days)
  const dayCounts: { [key: number]: number } = {
    1: 0, // Monday
    2: 0, // Tuesday
    3: 0, // Wednesday
    4: 0, // Thursday
    5: 0, // Friday
    6: 0, // Saturday
    7: 0, // Sunday
  };

  // Count each day in the range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const dayNumber = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to 1-7 format (1 = Monday)

    // Check if this date is a holiday
    const isHoliday = holidayDates.has(currentDate.toDateString());

    // Check if this day type is REST_DAY in shift pattern
    const shiftDay = shiftDays.find((sd) => sd.dayNumber === dayNumber);
    const isRestDay = shiftDay?.dayType === "REST_DAY";

    // Only count if it's NOT a holiday AND NOT a rest day
    if (!isHoliday && !isRestDay) {
      dayCounts[dayNumber]++;
    } else {
      console.log(
        `Excluding ${currentDate.toDateString()}: Holiday=${isHoliday}, RestDay=${isRestDay}`
      );
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log("Day counts in range:", dayCounts);
  console.log("Monday:", dayCounts[1]);
  console.log("Tuesday:", dayCounts[2]);
  console.log("Wednesday:", dayCounts[3]);
  console.log("Thursday:", dayCounts[4]);
  console.log("Friday:", dayCounts[5]);
  console.log("Saturday:", dayCounts[6]);
  console.log("Sunday:", dayCounts[7]);

  // Calculate total expected hours
  let totalExpectedHours = 0;

  for (const dayNumberStr of Object.keys(dayCounts)) {
    const dayNumber = parseInt(dayNumberStr);
    const dayCount = dayCounts[dayNumber];
    const shiftDay = shiftDays.find((sd) => sd.dayNumber === dayNumber);

    if (shiftDay && dayCount > 0) {
      // Calculate hours for this shift day
      const startTime = new Date(shiftDay.startTime);
      const endTime = new Date(shiftDay.endTime);
      const shiftHours =
        (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const breakHours = (shiftDay.breakTime || 0) / 60; // Convert minutes to hours
      const workingHours = shiftHours - breakHours;

      const totalHoursForThisDay = dayCount * Math.max(0, workingHours);
      totalExpectedHours += totalHoursForThisDay;

      console.log(
        `Day ${dayNumber}: ${dayCount} occurrences × ${workingHours.toFixed(
          2
        )} hours = ${totalHoursForThisDay.toFixed(2)} hours`
      );
    }
  }

  console.log("Total expected hours:", totalExpectedHours);
  return { expectedHours: totalExpectedHours, shiftDays };
};

// Helper function to calculate actual hours worked from WorkSession
const calculateActualHoursWorked = async (
  deviceUserId: string,
  startDate: Date,
  endDate: Date
): Promise<{ actualHours: number; sessions: any[] }> => {
  const workSessions = await prisma.workSession.findMany({
    where: {
      deviceUserId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      punchIn: { not: null },
      punchOut: { not: null },
    },
    include: {
      OvertimeTable: true,
    },
  });

  let totalActualHours = 0;
  for (const session of workSessions) {
    if (session.duration) {
      totalActualHours += session.duration / 60; // Convert minutes to hours
    }
  }

  return { actualHours: totalActualHours, sessions: workSessions };
};

// Note: Overtime calculation removed - to be handled separately

// Main function to calculate attendance-based payroll for an employee
const calculateAttendanceBasedPayroll = async (
  employee: any,
  payrollDefinition: any,
  companyId: string
): Promise<AttendancePayrollData> => {
  const startDate = new Date(payrollDefinition.startDate);
  const endDate = new Date(payrollDefinition.endDate);

  // Calculate expected hours based on shift type
  let expectedHours = 0;
  let shiftDays: any[] = [];

  const employeeShift = await prisma.employeeShift.findFirst({
    where: { employeeId: employee.id },
    include: {
      shift: {
        include: {
          patternDays: true,
        },
      },
    },
  });

  if (employeeShift?.shift.shiftType === "FIXED_WEEKLY") {
    const result = await calculateExpectedHoursFixedWeekly(
      employee.id,
      startDate,
      endDate,
      companyId
    );
    expectedHours = result.expectedHours;
    shiftDays = result.shiftDays;
  }
  console.log(employeeShift);
  // Calculate actual hours worked
  const { actualHours } = await calculateActualHoursWorked(
    employee.deviceUserId,
    startDate,
    endDate
  );

  // Overtime hours calculation removed - to be handled separately
  const overtimeHours = 0;

  // Holiday calculation removed - only consider working days

  // Calculate attendance rate
  const attendanceRate =
    expectedHours > 0 ? (actualHours / expectedHours) * 100 : 100;

  // Get basic salary and adjust it based on attendance rate
  const basicSalary = parseFloat(employee.payrollInfo?.basicSalary || "0");
  const adjustedBasicSalary =
    basicSalary * (Math.min(attendanceRate, 100) / 100);

  return {
    employeeId: employee.id,
    payrollDefinitionId: payrollDefinition.id,
    expectedHours,
    actualHours,
    attendanceRate: Math.min(attendanceRate, 100), // Cap at 100%
    adjustedBasicSalary,
  };
};

export const createPayroll = async (
  data: createPayrollInput & { companyId: string }
) => {
  const def = await prisma.payrollDefinition.findUnique({
    where: { id: data.payrollDefinitionId, companyId: data.companyId },
  });
  if (!def)
    throw new ApiError(httpStatus.BAD_REQUEST, "Payroll definition not found");

  const employees = await prisma.employee.findMany({
    where: { companyId: data.companyId, id: { in: data.employeeIds } },
    include: {
      ...employeeForPayrollInclude,
      payrollInfo: true,
    },
  });

  if (employees.length !== data.employeeIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "One or more employees not found"
    );
  }

  // Check for existing payroll records (simplified)
  const existing = await prisma.payroll.findMany({
    where: {
      employeeId: { in: data.employeeIds },
    },
  });

  if (existing.length) {
    console.log(existing);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payroll already exists for one or more employees in this period"
    );
  }

  const rows: any[] = []; // Will match the actual PayrollInfo model structure

  for (const emp of employees) {
    let payrollRecord: any; // Will be converted to PayrollInfoCreateManyInput

    if (emp.attendanceRequirement === "REQUIRED") {
      // For attendance-based employees
      const attendanceData = await calculateAttendanceBasedPayroll(
        emp,
        def,
        data.companyId
      );

      // Use attendance-based payroll calculation with working hours
      payrollRecord =
        await payrollUtil.calculatePayrollForEmployeeWithAttendance({
          employee: emp,
          companyId: data.companyId,
          payrollDefinitionId: def.id,
          workingHours: attendanceData.actualHours,
          expectedHours: attendanceData.expectedHours,
        });
    } else {
      // For non-attendance based employees, use standard payroll calculation
      payrollRecord = await payrollUtil.calculatePayrollForEmployee({
        employee: emp,
        companyId: data.companyId,
        payrollDefinitionId: def.id,
      });
    }

    rows.push(payrollRecord);
  }

  const createdPayroll = await prisma.payroll.createMany({ data: rows });

  // Check if any employees had attendance requirements
  const attendanceBasedCount = employees.filter(
    (emp) => emp.attendanceRequirement === "REQUIRED"
  ).length;
  const standardCount = employees.length - attendanceBasedCount;

  return {
    ...createdPayroll,
    message: `Payroll created successfully: ${attendanceBasedCount} attendance-based, ${standardCount} standard calculations`,
    attendanceBasedCalculation: attendanceBasedCount > 0,
    summary: {
      total: employees.length,
      attendanceBased: attendanceBasedCount,
      standard: standardCount,
    },
  };
};

////////

const getCurrentMonthPayroll = async (companyId: string) => {
  const currentPayrollDefinition =
    await payrolldefinitionService.getCurrentMonth(companyId);

  if (!currentPayrollDefinition) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Current payroll definition not found"
    );
  }

  // const payrolls = await prisma.payroll.findMany({
  //   where: { payrollDefinitionId: currentPayrollDefinition.id },
  // });

  // return payrolls;
};

const getPayrollByPayrollDefinitionId = async (payrollDefinitionId: string) => {
  const payrolls = await prisma.payroll.findMany({
    where: { payrollDefinitionId },
  });
  return payrolls;
};

const getNonPayrollEmployee = async (payrollDefinitionId: string) => {
  const payrollDefinition = await prisma.payrollDefinition.findUnique({
    where: { id: payrollDefinitionId },
  });

  if (!payrollDefinition)
    throw new ApiError(httpStatus.NOT_FOUND, "Payroll definition not found");

  const nonPayrollEmployees = await prisma.employee.findMany({
    where: {
      id: {
        notIn: await prisma.payroll
          .findMany({
            where: { payrollDefinitionId },
            select: { employeeId: true },
          })
          .then((payrolls) => payrolls.map((p) => p.employeeId)),
      },
    },
    select: {
      name: true,
      gradeHistory: {
        where: { toDate: null },
      },
      positionHistory: {
        where: { toDate: null },
      },
    },
  });

  return nonPayrollEmployees;
};

const getPayrollSetup = async (companyId: string) => {
  // const currentPayrollDefinition =
  //   await payrolldefinitionService.getCurrentMonth(companyId);
  // if (!currentPayrollDefinition) {
  //   throw new ApiError(
  //     httpStatus.NOT_FOUND,
  //     "Current payroll definition not found"
  //   );
  // }
  // //TODO: Implement payroll setup retrieval with approval
  // const Processedpayroll = await prisma.payroll.findMany({
  //   where: {
  //     payrollDefinitionId: currentPayrollDefinition.,
  //     status: "PENDING",
  //   },
  // });
  // const totalProcessedAmount = Processedpayroll.reduce(
  //   (acc, curr) => acc + curr.grossSalary.toNumber(),
  //   0
  // );
  // const UnprocessedPayroll = await prisma.payroll.findMany({
  //   where: {
  //     payrollDefinitionId: currentPayrollDefinition.id,
  //     status: "CREATED",
  //   },
  // });
  // const totalUnprocessedAmount = UnprocessedPayroll.reduce(
  //   (acc, curr) => acc + curr.grossSalary.toNumber(),
  //   0
  // );
  // return {
  //   processed: {
  //     count: Processedpayroll.length,
  //     totalAmount: totalProcessedAmount,
  //   },
  //   unprocessed: {
  //     count: UnprocessedPayroll.length,
  //     totalAmount: totalUnprocessedAmount,
  //   },
  // };
};

const getPayrollProcess = async (companyId: string, id: string) => {
  // const definition = await payrolldefinitionService.getCurrentMonth(companyId);
  // if (!definition || definition.id !== id) {
  //   throw new ApiError(
  //     httpStatus.NOT_FOUND,
  //     "Payroll definition not found for the current month"
  //   );
  // }
  // const data = await prisma.payroll.findMany({
  //   where: { payrollDefinitionId: { not: definition.id } },
  //   select: {
  //     employee: {
  //       select: {
  //         id: true,
  //         name: true,
  //         payrollInfo: {
  //           select: {
  //             employmentType: true,
  //             basicSalary: true,
  //             tinNumber: true,
  //           },
  //         },
  //         gradeHistory: {
  //           where: { toDate: null },
  //           select: {
  //             grade: {
  //               select: {
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   },
  // });
  // return data;
};

const getPayrollPayment = async (companyId: string) => {
  const currentPayrollDefinition =
    await payrolldefinitionService.getCurrentMonth(companyId);

  if (
    !currentPayrollDefinition ||
    !currentPayrollDefinition.payrollDefinition
  ) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Current payroll definition not found"
    );
  }

  const payrollPayments = await prisma.payroll.findMany({
    where: {
      payrollDefinitionId: currentPayrollDefinition.payrollDefinition.id,
      status: "CREATED",
    },
    select: {
      totalAllowance: true,
      totalDeduction: true,
      taxableIncome: true,
      grossSalary: true,
      netSalary: true,
      employee: {
        select: {
          id: true,
          name: true,
          payrollInfo: {
            select: {
              basicSalary: true,
              employmentType: true,
              tinNumber: true,
            },
          },
          gradeHistory: {
            where: { toDate: null },
            select: {
              grade: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return payrollPayments;
};

export default {
  createPayroll,
  calculateAttendanceBasedPayroll,
  calculateExpectedHoursFixedWeekly,
  calculateActualHoursWorked,
  getCurrentMonthPayroll,
  getPayrollByPayrollDefinitionId,
  getNonPayrollEmployee,
  getPayrollSetup,
  getPayrollProcess,
  getPayrollPayment,
};
