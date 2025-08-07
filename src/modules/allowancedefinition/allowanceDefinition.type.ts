import { z } from "zod";
import {
  createAllowanceDefinitionSchema,
  updateAllowanceDefinitionSchema,
  getAllowanceDefinitionByIdSchema,
} from "./allowanceDefinition.validation";

export type CreateAllowanceDefinitionInput = z.infer<
  typeof createAllowanceDefinitionSchema
>;
export type UpdateAllowanceDefinitionInput = z.infer<
  typeof updateAllowanceDefinitionSchema
>;
export type GetAllowanceDefinitionByIdParams = z.infer<
  typeof getAllowanceDefinitionByIdSchema
>;
