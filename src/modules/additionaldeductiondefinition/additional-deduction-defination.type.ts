import { z } from "zod";
import additionalDeductionDefinitionValidation from "./additionalDeductionDefinition.validation";

export type createAdditionalDeductionDefination = z.infer<
  typeof additionalDeductionDefinitionValidation.create.body
>;

export type getAdditionalDeductionDefinationParams = z.infer<
  typeof additionalDeductionDefinitionValidation.getById.params
>;

export type updateAdditionalDeductionDefinationParams = z.infer<
  typeof additionalDeductionDefinitionValidation.update.params
>;
export type updateAdditionalDeductionDefinationBody = z.infer<
  typeof additionalDeductionDefinitionValidation.update.body
>;
