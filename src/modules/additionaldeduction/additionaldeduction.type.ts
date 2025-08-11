import { z } from "zod";
import {
  createAdditionalDeductionSchema,
  updateAdditionalDeductionSchema,
  getAdditionalDeductionByIdSchema,
} from "./additionaldeduction.validation";

export type CreateAdditionalDeductionInput = z.infer<
  typeof createAdditionalDeductionSchema.body
>;
export type UpdateAdditionalDeductionInput = z.infer<
  typeof updateAdditionalDeductionSchema.body
>;
export type GetAdditionalDeductionByIdParams = z.infer<
  typeof getAdditionalDeductionByIdSchema.params
>;
export type UpdateAdditionalDeductionParams = z.infer<
  typeof updateAdditionalDeductionSchema.params
>;
