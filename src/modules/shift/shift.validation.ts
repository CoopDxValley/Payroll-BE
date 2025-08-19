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
      startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Start time must be in HH:MM:SS format"),
      endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "End time must be in HH:MM:SS format"),
      breakTime: z.number().min(0, "Break time must be non-negative"),
      gracePeriod: z.number().min(0, "Grace period must be non-negative"),
    })).optional().refine((days) => {
      // For FIXED_WEEKLY shifts, patternDays are required
      return true; // This will be handled in the service
    }, "Pattern days are required for FIXED_WEEKLY shifts"),
  })
  
  .refine((data) => {
    // If shiftType is FIXED_WEEKLY, enforce exactly 7 pattern days
    if (data.shiftType === "FIXED_WEEKLY") {
      if (!data.patternDays || data.patternDays.length !== 7) {
        return false;
      }
      
      // Check if all day numbers 1-7 are present
      const dayNumbers = data.patternDays.map(day => day.dayNumber).sort();
      const expectedDays = [1, 2, 3, 4, 5, 6, 7];
      
      if (JSON.stringify(dayNumbers) !== JSON.stringify(expectedDays)) {
        return false;
      }
    }
    
    return true;
  }, {
    message: "FIXED_WEEKLY shifts must have exactly 7 pattern days covering all days (1-7, Monday-Sunday)",
    path: ["patternDays"]
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
      startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "Start time must be in HH:MM:SS format"),
      endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/, "End time must be in HH:MM:SS format"),
      breakTime: z.number().min(0, "Break time must be non-negative"),
      gracePeriod: z.number().min(0, "Grace period must be non-negative"),
    })).optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => {
    // If updating to FIXED_WEEKLY or updating patternDays for FIXED_WEEKLY, enforce 7 days
    if (data.shiftType === "FIXED_WEEKLY" || data.patternDays) {
      if (!data.patternDays || data.patternDays.length !== 7) {
        return false;
      }
      
      // Check if all day numbers 1-7 are present
      const dayNumbers = data.patternDays.map(day => day.dayNumber).sort();
      const expectedDays = [1, 2, 3, 4, 5, 6, 7];
      
      if (JSON.stringify(dayNumbers) !== JSON.stringify(expectedDays)) {
        return false;
      }
    }
    
    return true;
  }, {
    message: "FIXED_WEEKLY shifts must have exactly 7 pattern days covering all days (1-7, Monday-Sunday)",
    path: ["patternDays"]
  }),
};

export default {
  createShift,
  updateShift,
};
