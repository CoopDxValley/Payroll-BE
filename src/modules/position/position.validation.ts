import { z } from "zod";

const createPosition = {
  body: z.object({
    positionName: z.string().trim(),
    description: z.string().trim().optional(),
  }),
};

const getOrDeletePosition = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

const updatePosition = {
  params: getOrDeletePosition.params,
  body: z.object({
    positionName: z.string().trim().optional(),
    description: z.string().trim().optional(),
    isActive: z.boolean().optional(),
  }),
};

export default {
  createPosition,
  updatePosition,
  getOrDeletePosition,
};
