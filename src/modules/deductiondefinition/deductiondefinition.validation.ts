import { z } from "zod";
import { safeName, UUID } from "../../validations/security";

export const createDeductionDefinitionSchema = z
  .object({
    name: safeName,
    isActive: z.boolean().optional(),
  })
  .strict();

export const updateDeductionDefinitionSchema = z
  .object({
    name: safeName.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const getDeductionDefinitionByIdSchema = z
  .object({
    id: UUID,
  })
  .strict();
