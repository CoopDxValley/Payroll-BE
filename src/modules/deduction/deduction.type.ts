import { z } from "zod";
import {
  createDeductionSchema,
  updateDeductionSchema,
  getDeductionByIdSchema,
} from "./deduction.validation";

export type CreateDeductionInput = z.infer<typeof createDeductionSchema>;
export type UpdateDeductionInput = z.infer<typeof updateDeductionSchema>;
export type GetDeductionByIdParams = z.infer<typeof getDeductionByIdSchema>;
