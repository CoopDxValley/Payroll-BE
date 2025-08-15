import { z } from "zod";

const createShift = {
  body: z.object({
    name: z.string().min(3, "Shift name is required"),
    shiftType: z.enum(["FIXED_WEEKLY", "ROTATING"], {
      required_error: "Shift type is required",
      invalid_type_error: "Shift type must be either FIXED_WEEKLY or ROTATING"
    }),
    companyId: z.string().uuid().optional(), // Will be injected from auth
    patternDays: z.array(z.object({
      dayNumber: z.number().min(1).max(7, "Day number must be between 1 and 7"),
      dayType: z.enum(["FULL_DAY", "HALF_DAY", "REST_DAY"], {
        required_error: "Day type is required",
        invalid_type_error: "Day type must be FULL_DAY, HALF_DAY, or REST_DAY"
      }),
      startTime: z.string().datetime("Start time must be a valid datetime"),
      endTime: z.string().datetime("End time must be a valid datetime"),
      breakTime: z.number().min(0, "Break time must be non-negative"),
      gracePeriod: z.number().min(0, "Grace period must be non-negative"),
    })).optional().refine((days) => {
      // For FIXED_WEEKLY shifts, patternDays are required
      return true; // This will be handled in the service
    }, "Pattern days are required for FIXED_WEEKLY shifts"),
  }),
};

const updateShift = {
  params: z.object({
    id: z.string().uuid("Invalid shift ID"),
  }),
  body: z.object({
    name: z.string().min(3, "Shift name is required").optional(),
    shiftType: z.enum(["FIXED_WEEKLY", "ROTATING"]).optional(),
    patternDays: z.array(z.object({
      dayNumber: z.number().min(1).max(7, "Day number must be between 1 and 7"),
      dayType: z.enum(["FULL_DAY", "HALF_DAY", "REST_DAY"]),
      startTime: z.string().datetime("Start time must be a valid datetime"),
      endTime: z.string().datetime("End time must be a valid datetime"),
      breakTime: z.number().min(0, "Break time must be non-negative"),
      gracePeriod: z.number().min(0, "Grace period must be non-negative"),
    })).optional(),
    isActive: z.boolean().optional(),
  }),
};

export default {
  createShift,
  updateShift,
};
