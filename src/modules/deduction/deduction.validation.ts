import { z } from "zod";
import { amount, UUID } from "../../validations/security";

export const createDeductionSchema = z
  .object({
    amount,
    deductionDefinitionId: UUID,
    gradeId: UUID,
  })
  .strict();

export const updateDeductionSchema = z
  .object({
    amount: amount.optional(),
    deductionDefinitionId: UUID.optional(),
    gradeId: UUID.optional(),
  })
  .strict();

export const getDeductionByIdSchema = z
  .object({
    id: UUID,
  })
  .strict();
