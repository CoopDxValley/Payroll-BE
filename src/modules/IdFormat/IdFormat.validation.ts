import { z } from "zod";
import { UUID } from "../../validations/security";

const validOrderTokens = ["companyCode", "year", "department"] as const;

const SeparatorInput = z.union([
  z.literal("/"),
  z.literal("-"),
  // z.literal("SLASH"),
  // z.literal("DASH"),
]);
//   .transform((val) => (val === "/" ? "SLASH" : val === "-" ? "DASH" : val));

const orderValidator = z
  .string()
  .min(1, "order is required")
  .refine(
    (value) =>
      value.split(",").every((v) => validOrderTokens.includes(v.trim() as any)),
    {
      message:
        "Invalid value for order. Must be comma-separated values of 'companyCode', 'year', or 'department'.",
    }
  );

const createIdFormat = {
  body: z
    .object({
      companyCode: z.boolean().optional(),
      year: z.boolean().optional(),
      department: z.boolean().optional(),
      separator: SeparatorInput.optional(),
      isActive: z.boolean().optional(),
      digitLength: z.number().int().positive().max(20).optional(),
      order: orderValidator,
    })
    .strict(),
};

const updateIdFormat = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
  body: z
    .object({
      companyCode: z.boolean().optional(),
      year: z.boolean().optional(),
      department: z.boolean().optional(),
      separator: SeparatorInput.optional(),
      isActive: z.boolean().optional(),
      digitLength: z.number().int().positive().max(20).optional(),
      order: orderValidator.optional(),
    })
    .strict(),
};

const getOrDeleteIdFormat = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
};

export default {
  createIdFormat,
  updateIdFormat,
  getOrDeleteIdFormat,
};
