import { z } from "zod";
import {
  createDeductionDefinitionSchema,
  updateDeductionDefinitionSchema,
  getDeductionDefinitionByIdSchema,
} from "./deductiondefinition.validation";

export type CreateDeductionDefinitionInput = z.infer<
  typeof createDeductionDefinitionSchema
>;
export type UpdateDeductionDefinitionInput = z.infer<
  typeof updateDeductionDefinitionSchema
>;
export type GetDeductionDefinitionByIdParams = z.infer<
  typeof getDeductionDefinitionByIdSchema
>;
