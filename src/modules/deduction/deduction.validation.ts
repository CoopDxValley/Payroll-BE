import { z } from "zod";

export const createDeductionSchema = z.object({
  amount: z.number().min(0, "amount must be non-negative"),
  deductionDefinitionId: z.string().uuid("Invalid deduction definition ID"),
  gradeId: z.string().uuid("Invalid grade ID"),
  //   companyId: z.string().uuid("Invalid company ID"),
});

export const updateDeductionSchema = z.object({
  amount: z.number().min(0, "amount must be non-negative").optional(),
  deductionDefinitionId: z
    .string()
    .uuid("Invalid deduction definition ID")
    .optional(),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
});

export const getDeductionByIdSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});
