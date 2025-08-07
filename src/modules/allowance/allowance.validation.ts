import { z } from "zod";

export const createAllowanceSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid amount"),
  allowanceDefinitionId: z.string().uuid("Invalid allowance definition ID"),
  gradeId: z.string().uuid("Invalid grade ID"),
  //   companyId: z.string().uuid("Invalid company ID"),
});

export const updateAllowanceSchema = z.object({
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount")
    .optional(),
  allowanceDefinitionId: z
    .string()
    .uuid("Invalid allowance definition ID")
    .optional(),
  gradeId: z.string().uuid("Invalid grade ID").optional(),
});

export const getAllowanceByIdSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});
