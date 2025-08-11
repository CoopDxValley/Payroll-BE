import { z } from "zod";

export const createAdditionalDeductionSchema = {
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    employeeId: z.string().uuid("Invalid employee ID"),
    additionalDeductionDefinitionId: z
      .string()
      .uuid("Invalid additional deduction definition ID"),
  }),
};

export const getAdditionalDeductionByIdSchema = {
  params: z.object({
    id: z.string().uuid("Invalid ID"),
  }),
};

export const updateAdditionalDeductionSchema = {
  body: z.object({
    amount: z.number().positive().optional(),
  }),
  params: getAdditionalDeductionByIdSchema.params,
};
