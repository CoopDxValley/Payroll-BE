import { z } from "zod";

export const createAllowanceDefinitionSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    isTaxable: z.boolean().optional(),
    isExempted: z.boolean().optional(),
    exemptedAmount: z.number().positive("Amount must be positive").nullable(),
    startingAmount: z.number().positive("Amount must be positive").nullable(),
    isActive: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.isExempted === true) {
      if (data.exemptedAmount === null || data.exemptedAmount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["exemptedAmount"],
          message: "Exempted amount is required when isExempted is true",
        });
      }
      if (data.startingAmount === null || data.startingAmount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startingAmount"],
          message: "Starting amount is required when isExempted is true",
        });
      }
    }
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
