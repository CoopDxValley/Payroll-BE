// import prisma from "../../client";
// import httpStatus from "http-status";
// import ApiError from "../../utils/api-error";
// import attendanceService from "./attendance.service";

// interface PayrollCalculationResult {
//   employeeId: string;
//   calculationType: string;
//   baseSalary?: number;
//   hourlyRate?: number;
//   totalHours?: number;
//   attendanceBasedPay?: number;
//   finalPay: number;
//   attendanceRequired: boolean;
//   attendanceData?: any;
// }

// interface PayrollPeriod {
//   startDate: string;
//   endDate: string;
// }

// const calculatePayrollForEmployee = async (
//   employeeId: string,
//   period: PayrollPeriod
// ): Promise<PayrollCalculationResult> => {
//   // Get employee with payroll configuration
//   const employee = await prisma.employee.findUnique({
//     where: { id: employeeId },
//     select: {
//       id: true,
//       name: true,
//       payrollCalculationType: true,
//       attendanceRequirement: true,
//       hourlyRate: true,
//       baseSalary: true,
//     },
//   });

//   if (!employee) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
//   }

//   const result: PayrollCalculationResult = {
//     employeeId,
//     calculationType: employee.payrollCalculationType,
//     baseSalary: employee.baseSalary,
//     hourlyRate: employee.hourlyRate,
//     finalPay: 0,
//     attendanceRequired: employee.attendanceRequirement === "REQUIRED",
//   };

//   // Get attendance data if required or optional
//   if (employee.attendanceRequirement !== "NOT_REQUIRED") {
//     const attendanceRecords = await attendanceService.getAttendanceByRange(
//       period.startDate,
//       period.endDate,
//       employeeId
//     );

//     result.attendanceData = {
//       totalRecords: attendanceRecords.length,
//       records: attendanceRecords,
//     };

//     // Calculate total hours worked
//     result.totalHours = calculateTotalHours(attendanceRecords);
//   }

//   // Calculate pay based on employee type
//   switch (employee.payrollCalculationType) {
//     case "FIXED_SALARY":
//       result.finalPay = calculateFixedSalary(employee, result);
//       break;

//     case "HOURLY_ATTENDANCE":
//       result.finalPay = calculateHourlyPay(employee, result);
//       break;

//     case "MIXED":
//       result.finalPay = calculateMixedPay(employee, result);
//       break;

//     case "COMMISSION_BASED":
//       result.finalPay = calculateCommissionPay(employee, result);
//       break;

//     case "CONTRACT":
//       result.finalPay = calculateContractPay(employee, result);
//       break;

//     default:
//       throw new ApiError(httpStatus.BAD_REQUEST, "Invalid payroll calculation type");
//   }

//   return result;
// };

// const calculateFixedSalary = (employee: any, result: PayrollCalculationResult): number => {
//   // Fixed salary regardless of attendance
//   return employee.baseSalary || 0;
// };

// const calculateHourlyPay = (employee: any, result: PayrollCalculationResult): number => {
//   // Pay based on hours worked
//   if (!employee.hourlyRate) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Hourly rate not set for hourly employee");
//   }

//   if (!result.attendanceRequired && result.totalHours === undefined) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Attendance data required for hourly employee");
//   }

//   const hoursWorked = result.totalHours || 0;
//   result.attendanceBasedPay = hoursWorked * employee.hourlyRate;

//   return result.attendanceBasedPay;
// };

// const calculateMixedPay = (employee: any, result: PayrollCalculationResult): number => {
//   // Base salary + attendance-based bonuses/deductions
//   const basePay = employee.baseSalary || 0;
//   let attendanceBonus = 0;

//   if (result.totalHours && employee.hourlyRate) {
//     // Calculate overtime or bonus hours
//     const standardHours = 160; // Assuming 160 hours per month standard
//     const extraHours = Math.max(0, result.totalHours - standardHours);
//     attendanceBonus = extraHours * employee.hourlyRate;
//   }

//   result.attendanceBasedPay = attendanceBonus;
//   return basePay + attendanceBonus;
// };

// const calculateCommissionPay = (employee: any, result: PayrollCalculationResult): number => {
//   // Commission-based pay, attendance might be optional
//   // This would typically involve sales data, not just attendance
//   const basePay = employee.baseSalary || 0;

//   // Add attendance bonus if applicable
//   let attendanceBonus = 0;
//   if (result.totalHours && employee.hourlyRate) {
//     attendanceBonus = result.totalHours * (employee.hourlyRate * 0.1); // 10% of hourly rate as attendance bonus
//   }

//   result.attendanceBasedPay = attendanceBonus;
//   return basePay + attendanceBonus;
// };

// const calculateContractPay = (employee: any, result: PayrollCalculationResult): number => {
//   // Contract-based pay, usually fixed regardless of attendance
//   return employee.baseSalary || 0;
// };

// const calculateTotalHours = (attendanceRecords: any[]): number => {
//   let totalHours = 0;

//   // Group records by date
//   const recordsByDate = attendanceRecords.reduce((acc, record) => {
//     const date = record.date.toISOString().split('T')[0];
//     if (!acc[date]) acc[date] = [];
//     acc[date].push(record);
//     return acc;
//   }, {});

//   // Calculate hours for each day
//   for (const date in recordsByDate) {
//     const dailyRecords = recordsByDate[date]
//       .filter((r: any) => !r.isAbsent && r.checkTime)
//       .sort((a: any, b: any) => new Date(a.checkTime).getTime() - new Date(b.checkTime).getTime());

//     if (dailyRecords.length >= 2) {
//       const firstCheckIn = dailyRecords.find((r: any) => r.checkType === 'IN');
//       const lastCheckOut = dailyRecords.reverse().find((r: any) => r.checkType === 'OUT');

//       if (firstCheckIn && lastCheckOut) {
//         const hoursWorked = (
//           new Date(lastCheckOut.checkTime).getTime() -
//           new Date(firstCheckIn.checkTime).getTime()
//         ) / (1000 * 60 * 60);

//         totalHours += Math.max(0, hoursWorked);
//       }
//     }
//   }

//   return Math.round(totalHours * 100) / 100; // Round to 2 decimal places
// };

// const getEmployeesByAttendanceRequirement = async (
//   companyId: string,
//   attendanceRequirement?: string
// ) => {
//   const where: any = { companyId };

//   if (attendanceRequirement) {
//     where.attendanceRequirement = attendanceRequirement;
//   }

//   return prisma.employee.findMany({
//     where,
//     select: {
//       id: true,
//       name: true,
//       username: true,
//       payrollCalculationType: true,
//       attendanceRequirement: true,
//       hourlyRate: true,
//       baseSalary: true,
//       deviceUserId: true,
//     },
//   });
// };

// const bulkCalculatePayroll = async (
//   companyId: string,
//   period: PayrollPeriod,
//   attendanceRequiredOnly: boolean = false
// ) => {
//   const employees = await getEmployeesByAttendanceRequirement(
//     companyId,
//     attendanceRequiredOnly ? "REQUIRED" : undefined
//   );

//   const results = [];
//   const errors = [];

//   for (const employee of employees) {
//     try {
//       const payrollResult = await calculatePayrollForEmployee(employee.id, period);
//       results.push(payrollResult);
//     } catch (error) {
//       errors.push({
//         employeeId: employee.id,
//         employeeName: employee.name,
//         error: error instanceof Error ? error.message : "Unknown error",
//       });
//     }
//   }

//   return { results, errors };
// };

// const updateEmployeePayrollSettings = async (
//   employeeId: string,
//   settings: {
//     payrollCalculationType?: string;
//     attendanceRequirement?: string;
//     hourlyRate?: number;
//     baseSalary?: number;
//   }
// ) => {
//   return prisma.employee.update({
//     where: { id: employeeId },
//     data: settings,
//   });
// };

// export default {
//   calculatePayrollForEmployee,
//   getEmployeesByAttendanceRequirement,
//   bulkCalculatePayroll,
//   updateEmployeePayrollSettings,
//   calculateTotalHours,
// };
