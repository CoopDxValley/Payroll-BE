import { z } from "zod";
// import { objectId } from "./custom.validation";

const createShift = {
  body: z.object({
    name: z.string().min(3, "Shift name is required"),
    cycleDays: z.number().min(1),
    companyId: z.string().uuid().optional(), // Will be injected from auth
  }),
};


const updateShift = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    breakTime: z.number(),
    gracePeriod: z.number(),
    isActive: z.boolean(),
  }),
};

export default {
  createShift,
  updateShift,
};
