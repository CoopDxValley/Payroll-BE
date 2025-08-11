import { z } from "zod";
import { amount, UUID } from "../../validations/security";

export const createAdditionalDeductionSchema = {
  body: z
    .object({
      amount,
      employeeId: UUID,
      additionalDeductionDefinitionId: UUID,
    })
    .strict(),
};

export const getAdditionalDeductionByIdSchema = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
};

export const updateAdditionalDeductionSchema = {
  body: z
    .object({
      amount: amount.optional(),
    })
    .strict(),
  params: getAdditionalDeductionByIdSchema.params,
};
