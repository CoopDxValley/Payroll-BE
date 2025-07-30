import { z } from "zod";

const createAttendance = {
  body: z.object({
    date: z.string().datetime().optional(), // Optional for manual entry
    checkTime: z.string().datetime(),
    checkType: z.enum(["PUNCHIN", "PUNCHOUT"]).optional(),
    verifyMode: z.number().optional(),
    workCode: z.number().optional(),
    sensorId: z.string().optional(),
    deviceIp: z.string().optional(),
    deviceUserId: z.string().optional(),
    isAbsent: z.boolean().optional().default(false),
  }),
};

const processDeviceData = {
  body: z.object({
    attendanceRecords: z.array(
      z.object({
        deviceUserId: z.string(),
        checkTime: z.string().datetime(),
        verifyMode: z.number(),
        workCode: z.number(),
        sensorId: z.string().optional(),
        deviceIp: z.string().optional(),
      })
    ),
  }),
};

const bulkCreateAttendance = {
  body: z.object({
    employeeId: z.string().uuid(),
    records: z.array(
      z.object({
        date: z.string().datetime(),
        checkTime: z.string().datetime(),
        checkType: z.enum(["IN", "OUT"]).optional(),
        verifyMode: z.number().optional(),
        workCode: z.number().optional(),
        sensorId: z.string().optional(),
        deviceIp: z.string().optional(),
        deviceUserId: z.string().optional(),
      })
    ),
  }),
};

// New validation for bulk device registration
const bulkDeviceRegistration = {
  body: z.object({
    records: z.array(
      z.object({
        user_id: z.string(), // UserID from ZK device
        timestamp: z.string(), // Timestamp from ZK device (will be parsed to Date)
        status: z.number().optional(), // Status from ZK device
        punch: z.number().optional(), // Punch from ZK device
        uid: z.string().optional(), // UID from ZK device
        device_ip: z.string().optional(), // Device IP for tracking
      })
    ),
  }),
};

const getAttendanceByDate = {
  query: z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
    employeeId: z.string().uuid().optional(),
  }),
};

const getAttendanceByRange = {
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    employeeId: z.string().uuid().optional(),
  }),
};

const updateAttendanceTimestamp = {
  body: z.object({
    checkTime: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid ISO date string",
    }),
  }),
};

export default {
  createAttendance,
  processDeviceData,
  bulkCreateAttendance,
  bulkDeviceRegistration,
  getAttendanceByDate,
  getAttendanceByRange,
  updateAttendanceTimestamp,
};
