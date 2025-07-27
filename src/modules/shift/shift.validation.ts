import { z } from "zod";
// import { objectId } from "./custom.validation";

const createShift = {
  body: z.object({
    name: z.string(),
    startTime: z.date(),
    endTime: z.date(),
    breakTime: z.number(),
    gracePeriod: z.number(),
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
