import { z } from "zod";
import { OvertimeType, OvertimeStatus } from "../updatedAttendance/updatedAttendance.type";

// Enhanced Overtime Validation Schemas

// Today's overtime validation
export const getTodaysOvertimeValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    overtimeType: z.nativeEnum(OvertimeType).optional(),
    overtimeStatus: z.nativeEnum(OvertimeStatus).optional(),
  }),
};

// Date range overtime validation
export const getOvertimeByDateRangeValidation = {
  query: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    overtimeType: z.nativeEnum(OvertimeType).optional(),
    overtimeStatus: z.nativeEnum(OvertimeStatus).optional(),
  }).refine((data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
  }, {
    message: "Start date must be before or equal to end date",
  }),
};

// Weekly overtime validation
export const getWeeklyOvertimeValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    overtimeType: z.nativeEnum(OvertimeType).optional(),
    overtimeStatus: z.nativeEnum(OvertimeStatus).optional(),
  }),
};

// Monthly overtime validation
export const getMonthlyOvertimeValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    overtimeType: z.nativeEnum(OvertimeType).optional(),
    overtimeStatus: z.nativeEnum(OvertimeStatus).optional(),
  }),
};

// Yearly overtime validation
export const getYearlyOvertimeValidation = {
  query: z.object({
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    overtimeType: z.nativeEnum(OvertimeType).optional(),
    overtimeStatus: z.nativeEnum(OvertimeStatus).optional(),
  }),
};

// Overtime by specific date validation
export const getOvertimeByDateValidation = {
  query: z.object({
    date: z.string().min(1, "Date is required"),
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    overtimeType: z.nativeEnum(OvertimeType).optional(),
    overtimeStatus: z.nativeEnum(OvertimeStatus).optional(),
  }).refine((data) => {
    const date = new Date(data.date);
    return !isNaN(date.getTime());
  }, {
    message: "Invalid date format",
  }),
};

// Overtime summary validation
export const getOvertimeSummaryValidation = {
  query: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    deviceUserId: z.string().optional(),
    shiftId: z.string().optional(),
    overtimeType: z.nativeEnum(OvertimeType).optional(),
    overtimeStatus: z.nativeEnum(OvertimeStatus).optional(),
  }).refine((data) => {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate <= endDate;
  }, {
    message: "Start date must be before or equal to end date",
  }),
};

// OvertimeTable CRUD Validation Schemas
export const createOvertimeTableValidation = {
  body: z.object({
    deviceUserId: z.string().min(1, "Device user ID is required"),
    date: z.string().min(1, "Date is required"),
    punchIn: z.string().min(1, "Punch in time is required"),
    punchInSource: z.string().default("manual"),
    punchOut: z.string().min(1, "Punch out time is required"),
    punchOutSource: z.string().default("manual"),
    type: z.nativeEnum(OvertimeType, {
      errorMap: () => ({ message: "Invalid overtime type" }),
    }),
    workSessionId: z.string().optional(),
    notes: z.string().optional(),
  }),
};

export const updateOvertimeTableValidation = {
  params: z.object({
    id: z.string().min(1, "Overtime record ID is required"),
  }),
  body: z.object({
    punchIn: z.string().optional(),
    punchInSource: z.string().optional(),
    punchOut: z.string().optional(),
    punchOutSource: z.string().optional(),
    type: z.nativeEnum(OvertimeType, {
      errorMap: () => ({ message: "Invalid overtime type" }),
    }).optional(),
    workSessionId: z.string().optional(),
    notes: z.string().optional(),
  }),
};

export const getOvertimeTableByIdValidation = {
  params: z.object({
    id: z.string().min(1, "Overtime record ID is required"),
  }),
};

export const deleteOvertimeTableValidation = {
  params: z.object({
    id: z.string().min(1, "Overtime record ID is required"),
  }),
};

export const updateOvertimeStatusValidation = {
  params: z.object({
    id: z.string().min(1, "Overtime record ID is required"),
  }),
  body: z.object({
    status: z.nativeEnum(OvertimeStatus, {
      errorMap: () => ({ message: "Invalid overtime status" }),
    }),
    notes: z.string().optional(),
  }),
};

export default {
  // Enhanced Overtime Endpoints
  getTodaysOvertime: getTodaysOvertimeValidation,
  getOvertimeByDateRange: getOvertimeByDateRangeValidation,
  getWeeklyOvertime: getWeeklyOvertimeValidation,
  getMonthlyOvertime: getMonthlyOvertimeValidation,
  getYearlyOvertime: getYearlyOvertimeValidation,
  getOvertimeByDate: getOvertimeByDateValidation,
  getOvertimeSummary: getOvertimeSummaryValidation,
  
  // OvertimeTable CRUD
  createOvertimeTable: createOvertimeTableValidation,
  updateOvertimeTable: updateOvertimeTableValidation,
  getOvertimeTableById: getOvertimeTableByIdValidation,
  deleteOvertimeTable: deleteOvertimeTableValidation,
  updateOvertimeStatus: updateOvertimeStatusValidation,
}; 