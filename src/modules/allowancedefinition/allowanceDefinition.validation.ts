import { z } from "zod";

export const createAllowanceDefinitionSchema = z.object({
  name: z.string().min(2, "Name is required"),
  isTaxable: z.boolean().optional(),
  isExempted: z.boolean().optional(),
  exemptedAmount: z.number().positive("Amount must be positive").optional(),
  startingAmount: z.number().positive("Amount must be positive").optional(),
  //   companyId: z.string().uuid("Invalid company ID"),
  isActive: z.boolean().optional(),
});

export const updateAllowanceDefinitionSchema = z.object({
  name: z.string().min(2).optional(),
  isTaxable: z.boolean().optional(),
  isExempted: z.boolean().optional(),
  exemptedAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal")
    .optional(),
  startingAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid decimal")
    .optional(),
  isActive: z.boolean().optional(),
});

export const getAllowanceDefinitionByIdSchema = z.object({
  id: z.string().uuid("Invalid ID"),
});
