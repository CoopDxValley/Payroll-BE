import { z } from "zod";

export const createDeductionDefinitionSchema = z.object({
  name: z.string().min(2, "Name is required"),
  isActive: z.boolean().optional(),
});

export const updateDeductionDefinitionSchema = z.object({
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const getDeductionDefinitionByIdSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});
