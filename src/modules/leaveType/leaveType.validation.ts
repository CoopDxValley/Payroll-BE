import { z } from "zod";

const createLeaveType = {
  body: z.object({
    name: z.string().min(1, "leave type name is required"),
    description: z.string().optional(),
    maxDaysYearly: z.number().min(0),
    isPaid: z.boolean().optional(),
    carryForward: z.boolean().optional(),
  }),
};

const updateLeaveType = {
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    maxDaysYearly: z.number().min(0).optional(),
    isPaid: z.boolean().optional(),
    carryForward: z.boolean().optional(),
  }),
};

export default {
  createLeaveType,
  updateLeaveType,
};
