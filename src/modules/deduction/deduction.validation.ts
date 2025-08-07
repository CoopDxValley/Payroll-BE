import { z } from "zod";

export const createDeductionSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  deductionDefinitionId: z.string().uuid("Invalid deduction definition ID"),
  gradeId: z.string().uuid("Invalid grade ID"),
  //   companyId: z.string().uuid("Invalid company ID"),
});

export const updateDeductionSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount")
    .optional(),
  deductionDefinitionId: z
    .string()
    .uuid("Invalid deduction definition ID")
    .optional(),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
});

export const getDeductionByIdSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});
