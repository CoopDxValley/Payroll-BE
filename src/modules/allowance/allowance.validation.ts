import { z } from "zod";

export const createAllowanceSchema = z.object({
  amount: z.number().min(0, "Amount must be non-negative"),
  allowanceDefinitionId: z.string().uuid("Invalid allowance definition ID"),
  gradeId: z.string().uuid("Invalid grade ID"),
  //   companyId: z.string().uuid("Invalid company ID"),
});

export const updateAllowanceSchema = z.object({
  amount: z.number().min(0, "Amount must be non-negative").optional(),
  allowanceDefinitionId: z
    .string()
    .uuid("Invalid allowance definition ID")
    .optional(),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
});

export const getAllowanceByIdSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});
