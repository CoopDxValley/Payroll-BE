import { z } from "zod";

const createAttendance = {
  body: z.object({
    checkTime: z.date(),
    checkType: z.enum(["I", "O"]).optional(),
    verifyMode: z.number().optional(),
    workCode: z.number().optional(),
    sensorId: z.string().optional(),
    deviceIp: z.string().ip().optional(),
  }),
};

export default {
  createAttendance,
};
