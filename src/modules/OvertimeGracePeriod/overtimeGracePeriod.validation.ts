import { z } from "zod";

const createOvertimeGracePeriod = {
  body: z.object({
    gracePeriodMinutes: z
      .number()
      .int()
      .min(0)
      .max(1440)
      .optional()
      .default(10),
    isActive: z.boolean().optional().default(true),
  }),
};

const getOvertimeGracePeriodById = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

const getOvertimeGracePeriodByCompanyId = {
  params: z.object({
    companyId: z.string().uuid(),
  }),
};

const updateOvertimeGracePeriod = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    gracePeriodMinutes: z.number().int().min(0).max(1440).optional(),
    isActive: z.boolean().optional(),
  }),
};

const deleteOvertimeGracePeriod = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export default {
  createOvertimeGracePeriod,
  getOvertimeGracePeriodById,
  getOvertimeGracePeriodByCompanyId,
  updateOvertimeGracePeriod,
  deleteOvertimeGracePeriod,
};
