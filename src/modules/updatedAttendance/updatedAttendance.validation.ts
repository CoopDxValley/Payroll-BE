import { z } from "zod";
import { OvertimeType, OvertimeStatus } from "./updatedAttendance.type";

// Smart Attendance Validation Schema (Main API)
export const smartAttendanceValidation = {
  body: z.object({
    deviceUserId: z.string().min(1, "Device user ID is required"),
    date: z.string().min(1, "Date is required"),
    
    // ZKTeco device format
    checkTime: z.string().optional(),
    deviceIp: z.string().optional(),
    
    // Manual format (explicit punch in/out)
    punchIn: z.string().optional(),
    punchInSource: z.string().optional(),
    punchOut: z.string().optional(),
    punchOutSource: z.string().optional(),
    
    // Optional fields
    shiftId: z.string().optional(),
  }).refine((data) => {
    // Either checkTime OR (punchIn/punchOut) must be provided
    return data.checkTime || data.punchIn || data.punchOut;
  }, {
    message: "Either checkTime or punchIn/punchOut must be provided",
  }),
};

// Bulk Attendance Validation Schema
export const bulkAttendanceValidation = {
  body: z.object({
    attendanceRecords: z.array(
      z.object({
        deviceUserId: z.string().min(1, "Device user ID is required"),
        date: z.string().min(1, "Date is required"),
        
        // ZKTeco device format
        checkTime: z.string().optional(),
        deviceIp: z.string().optional(),
        
        // Manual format (explicit punch in/out)
        punchIn: z.string().optional(),
        punchInSource: z.string().optional(),
        punchOut: z.string().optional(),
        punchOutSource: z.string().optional(),
        
        // Optional fields
        shiftId: z.string().optional(),
      }).refine((data) => {
        // Either checkTime OR (punchIn/punchOut) must be provided
        return data.checkTime || data.punchIn || data.punchOut;
      }, {
        message: "Either checkTime or punchIn/punchOut must be provided",
      })
    ).min(1, "At least one attendance record is required").max(100, "Maximum 100 records allowed per batch"),
  }),
};

// WorkSession Validation Schemas
export const createWorkSessionValidation = {
  body: z.object({
    deviceUserId: z.string().min(1, "Device user ID is required"),
    date: z.string().min(1, "Date is required"),
    punchIn: z.string().optional(),
    punchInSource: z.string().default("manual"),
    punchOut: z.string().optional(),
    punchOutSource: z.string().default("manual"),
    shiftId: z.string().optional(),
  }),
};

export const updateWorkSessionValidation = {
  params: z.object({
    id: z.string().min(1, "Work session ID is required"),
  }),
  body: z.object({
    punchIn: z.string().optional(),
    punchInSource: z.string().optional(),
    punchOut: z.string().optional(),
    punchOutSource: z.string().optional(),
    shiftId: z.string().optional(),
  }),
};

export const getWorkSessionByIdValidation = {
  params: z.object({
    id: z.string().min(1, "Work session ID is required"),
  }),
};

export const deleteWorkSessionValidation = {
  params: z.object({
    id: z.string().min(1, "Work session ID is required"),
  }),
};

// Punch Validation Schemas
export const punchInValidation = {
  body: z.object({
    deviceUserId: z.string().min(1, "Device user ID is required"),
    date: z.string().min(1, "Date is required"),
    punchIn: z.string().optional(), // Optional: if not provided, uses current time
    punchInSource: z.string().optional(),
  }),
};

export const punchOutValidation = {
  body: z.object({
    deviceUserId: z.string().min(1, "Device user ID is required"),
    date: z.string().min(1, "Date is required"),
    punchOut: z.string().optional(), // Optional: if not provided, uses current time
    punchOutSource: z.string().optional(),
  }),
};

// OvertimeTable Validation Schemas
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
  }),
};

export default {
  // Smart Attendance (Main API)
  smartAttendance: smartAttendanceValidation,
  
  // Bulk Attendance API
  bulkAttendance: bulkAttendanceValidation,
  
  // WorkSession
  createWorkSession: createWorkSessionValidation,
  updateWorkSession: updateWorkSessionValidation,
  getWorkSessionById: getWorkSessionByIdValidation,
  deleteWorkSession: deleteWorkSessionValidation,
  
  // Punch (Legacy)
  punchIn: punchInValidation,
  punchOut: punchOutValidation,
  
  // OvertimeTable
  createOvertimeTable: createOvertimeTableValidation,
  updateOvertimeTable: updateOvertimeTableValidation,
  getOvertimeTableById: getOvertimeTableByIdValidation,
  deleteOvertimeTable: deleteOvertimeTableValidation,
  updateOvertimeStatus: updateOvertimeStatusValidation,
}; 