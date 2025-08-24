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
};
