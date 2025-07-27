import { z } from "zod";

const createPosition = {
  body: z.object({
    positionName: z.string().trim(),
    description: z.string().trim().optional(),
  }),
};

const updatePosition = {
  body: z.object({
    positionName: z.string().trim().optional(),
    description: z.string().trim().optional(),
    companyId: z.string().uuid().optional(),
    isActive: z.boolean().optional(),
  }),
};

const getOrDeletePosition = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export default {
  createPosition,
  updatePosition,
  getOrDeletePosition,
};
