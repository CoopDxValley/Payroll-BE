import { z } from "zod";

const createRotatingShiftType = {
  body: z.object({
    name: z.string().min(1, "Shift type name is required").max(50, "Shift type name too long"),
    startTime: z.string().regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      "Start time must be in HH:mm:ss format (e.g., 06:00:00, 18:00:00)"
    ),
    endTime: z.string().regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      "End time must be in HH:mm:ss format (e.g., 06:00:00, 18:00:00)"
    ),
  }).refine((data) => data.startTime !== data.endTime, {
    message: "Start time and end time cannot be the same",
    path: ["endTime"],
  }),
};

const updateRotatingShiftType = {
  params: z.object({
    id: z.string().uuid("Invalid shift type ID"),
  }),
  body: z.object({
    name: z.string().min(1, "Shift type name is required").max(50, "Shift type name too long").optional(),
    startTime: z.string().regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      "Start time must be in HH:mm:ss format (e.g., 06:00:00, 18:00:00)"
    ).optional(),
    endTime: z.string().regex(
      /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/,
      "End time must be in HH:mm:ss format (e.g., 06:00:00, 18:00:00)"
    ).optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => {
    // If both times are provided, they must be different
    if (data.startTime && data.endTime) {
      return data.startTime !== data.endTime;
    }
    return true;
  }, {
    message: "Start time and end time cannot be the same",
    path: ["endTime"],
  }),
};

const getRotatingShiftTypeById = {
  params: z.object({
    id: z.string().uuid("Invalid shift type ID"),
  }),
};

const deleteRotatingShiftType = {
  params: z.object({
    id: z.string().uuid("Invalid shift type ID"),
  }),
};

const deactivateRotatingShiftType = {
  params: z.object({
    id: z.string().uuid("Invalid shift type ID"),
  }),
};

const activateRotatingShiftType = {
  params: z.object({
    id: z.string().uuid("Invalid shift type ID"),
  }),
};

export default {
  createRotatingShiftType,
  updateRotatingShiftType,
  getRotatingShiftTypeById,
  deleteRotatingShiftType,
  deactivateRotatingShiftType,
  activateRotatingShiftType,
}; 