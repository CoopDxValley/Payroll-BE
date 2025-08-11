import { z } from "zod";
import { amount, UUID } from "../../validations/security";

export const createAdditionalPaySchema = {
  body: z
    .object({
      amount,
      employeeId: UUID,
      additionalPayDefinitionId: UUID,
    })
    .strict(),
};

export const getAdditionalPayByIdSchema = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
};

export const updateAdditionalPaySchema = {
  body: z
    .object({
      amount: amount.optional(),
    })
    .strict(),
  params: getAdditionalPayByIdSchema.params,
};
