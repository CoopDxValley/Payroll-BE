import { z } from "zod";
const isoDateTimeRegex =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|([+-]\d{2}:\d{2}))$/;
const createAttendance = {
  body: z.object({
    // date: z.string().datetime().optional(), // Optional for manual entry
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),

    checkTime: z
      .string()
      .transform((val) => val.replace(" ", "T") + "Z")
      .refine((val) => isoDateTimeRegex.test(val), {
        message: "Invalid ISO datetime format",
      }),

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
    // employeeId: z.string().uuid(),
    records: z.array(
      z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),

        checkTime: z
          .string()
          .transform((val) => val.replace(" ", "T") + "Z")
          .refine((val) => isoDateTimeRegex.test(val), {
            message: "Invalid ISO datetime format",
          }),

        checkType: z.enum(["PUNCHIN", "PUNCHOUT"]).optional(),
        verifyMode: z.number().optional(),
        workCode: z.number().optional(),
        sensorId: z.string().optional(),
        deviceIp: z.string().optional(),
        deviceUserId: z.string().optional(),
        isAbsent: z.boolean().optional().default(false),
      })
    ),
  }),
};

// New validation for bulk device registration
const bulkDeviceRegistration = {
  body: z.object({
    records: z.array(
      z.object({
        date: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),

        checkTime: z
          .string()
          .transform((val) => val.replace(" ", "T") + "Z")
          .refine((val) => isoDateTimeRegex.test(val), {
            message: "Invalid ISO datetime format",
          }),

        checkType: z.enum(["PUNCHIN", "PUNCHOUT"]).optional(),
        verifyMode: z.number().optional(),
        workCode: z.number().optional(),
        sensorId: z.string().optional(),
        deviceIp: z.string().optional(),
        deviceUserId: z.string().optional(),
        isAbsent: z.boolean().optional().default(false),
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
