import { z } from "zod";

// Enhanced Attendance Validation Schemas

// Today's attendance validation
export const getTodaysAttendanceValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
  }),
};

// Date range attendance validation
export const getAttendanceByDateRangeValidation = {
  query: z
    .object({
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
      deviceUserId: z.string().optional(),
      shiftId: z.string().optional(),
    })
    .refine(
      (data) => {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return (
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime()) &&
          startDate <= endDate
        );
      },
      {
        message: "Start date must be before or equal to end date",
      }
    ),
};

// Weekly attendance validation
export const getWeeklyAttendanceValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
  }),
};

// Monthly attendance validation
export const getMonthlyAttendanceValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    departmentId: z.string().optional(),
  }),
};

// Yearly attendance validation
export const getYearlyAttendanceValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
  }),
};

// Attendance by specific date validation
export const getAttendanceByDateValidation = {
  query: z
    .object({
      date: z.string().min(1, "Date is required"),
      deviceUserId: z.string().optional(),
      shiftId: z.string().optional(),
    })
    .refine(
      (data) => {
        const date = new Date(data.date);
        return !isNaN(date.getTime());
      },
      {
        message: "Invalid date format",
      }
    ),
};

// Attendance summary validation
export const getAttendanceSummaryValidation = {
  query: z
    .object({
      startDate: z.string().min(1, "Start date is required"),
      endDate: z.string().min(1, "End date is required"),
      deviceUserId: z.string().optional(),
      shiftId: z.string().optional(),
    })
    .refine(
      (data) => {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        return (
          !isNaN(startDate.getTime()) &&
          !isNaN(endDate.getTime()) &&
          startDate <= endDate
        );
      },
      {
        message: "Start date must be before or equal to end date",
      }
    ),
};

// Validation for getting attendance by payroll definition
const getAttendanceByPayrollDefinitionValidation = {
  params: z.object({
    payrollDefinitionId: z.string().uuid("Invalid payroll definition ID"),
  }),
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().uuid("Invalid shift ID").optional(),
    departmentId: z.string().uuid("Invalid department ID").optional(),
  }),
};

// Validation for getting recent attendance (last 5 days)
const getRecentAttendanceValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().uuid("Invalid shift ID").optional(),
    departmentId: z.string().uuid("Invalid department ID").optional(),
  }),
};

// Validation for getting employee attendance by current month payroll definition
const getEmployeeAttendanceByDateRangeValidation = {
  params: z.object({
    employeeId: z.string().uuid("Invalid employee ID"),
  }),
  query: z.object({}), // No query parameters needed
};

const getEmployeeAttendanceByPayrollDefinitionValidation = {
  params: z.object({
    payrollDefinitionId: z.string().uuid("Invalid payroll definition ID"),
    employeeId: z.string().uuid("Invalid employee ID"),
  }),
  query: z.object({}), // No query parameters needed
};

// Validation for getting payroll definition summary by ID
const getPayrollDefinitionSummaryByIdValidation = {
  params: z.object({
    payrollDefinitionId: z.string().uuid("Invalid payroll definition ID"),
  }),
  query: z.object({}), // No query parameters needed
};

// Export all validation schemas
export default {
  // Enhanced Attendance Endpoints
  getTodaysAttendance: getTodaysAttendanceValidation,
  getAttendanceByDateRange: getAttendanceByDateRangeValidation,
  getWeeklyAttendance: getWeeklyAttendanceValidation,
  getMonthlyAttendance: getMonthlyAttendanceValidation,
  getYearlyAttendance: getYearlyAttendanceValidation,
  getAttendanceByDate: getAttendanceByDateValidation,
  getAttendanceSummary: getAttendanceSummaryValidation,
  getAttendanceByPayrollDefinition: getAttendanceByPayrollDefinitionValidation,
  getRecentAttendance: getRecentAttendanceValidation,
  getEmployeeAttendanceByDateRange: getEmployeeAttendanceByDateRangeValidation,
  getEmployeeAttendanceByPayrollDefinition: getEmployeeAttendanceByPayrollDefinitionValidation,
  getPayrollDefinitionSummaryById: getPayrollDefinitionSummaryByIdValidation,
};
