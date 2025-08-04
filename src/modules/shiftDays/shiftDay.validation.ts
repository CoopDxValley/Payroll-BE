import { z } from "zod";
// import { objectId } from "./custom.validation";

const createShiftDay = {
  body: z.object({
    shiftId: z.string().uuid("Invalid shift ID"),
    dayNumber: z.number().min(1, "Day number must be at least 1"),
    dayType: z.enum(["WORK", "HALF_DAY", "OFF", "NIGHT"], {
      errorMap: () => ({ message: "Invalid day type" }),
    }),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format (e.g., 08:00, 17:30)"),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format (e.g., 08:00, 17:30)"),
    breakTime: z.number().min(0, "Break time must be non-negative"),
    gracePeriod: z.number().min(0, "Grace period must be non-negative"),
    companyId: z.string().uuid().optional(), // Will be injected from auth
  }),
};

const updateShiftDay = {
  params: z.object({
    id: z.string().uuid("Invalid shift day ID"),
  }),
  body: z.object({
    dayNumber: z.number().min(1, "Day number must be at least 1").optional(),
    dayType: z.enum(["WORK", "HALF_DAY", "OFF", "NIGHT"]).optional(),
    startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Start time must be in HH:MM format (e.g., 08:00, 17:30)").optional(),
    endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "End time must be in HH:MM format (e.g., 08:00, 17:30)").optional(),
    breakTime: z.number().min(0, "Break time must be non-negative").optional(),
    gracePeriod: z.number().min(0, "Grace period must be non-negative").optional(),
  }),
};

export default {
  createShiftDay,
  updateShiftDay,
}; 