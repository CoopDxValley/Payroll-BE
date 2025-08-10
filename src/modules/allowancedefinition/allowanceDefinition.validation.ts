import { z } from "zod";
import { amount, safeName, UUID } from "../../validations/security";

export const createAllowanceDefinitionSchema = z
  .object({
    name: safeName,
    isTaxable: z.boolean().optional(),
    isExempted: z.boolean().optional(),
    exemptedAmount: amount.nullable(),
    startingAmount: amount.nullable(),
    isActive: z.boolean().optional(),
  })
  .strict()
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

export const updateAllowanceDefinitionSchema = z
  .object({
    name: safeName.optional(),
    isTaxable: z.boolean().optional(),
    isExempted: z.boolean().optional(),
    exemptedAmount: amount.optional(),
    startingAmount: amount.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const getAllowanceDefinitionByIdSchema = z
  .object({
    id: UUID,
  })
  .strict();
