import { z } from "zod";
import { amount, UUID } from "../../validations/security";

export const createAllowanceSchema = z
  .object({
    amount,
    allowanceDefinitionId: UUID,
    gradeId: UUID,
  })
  .strict();

export const updateAllowanceSchema = z
  .object({
    amount: amount.optional(),
    allowanceDefinitionId: UUID.optional(),
    gradeId: UUID.optional(),
  })
  .strict();

export const getAllowanceByIdSchema = z.object({ id: UUID }).strict();
