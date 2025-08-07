import { z } from "zod";
import pensionValidation from "./pension.validation";

export type CreatePensionInput = z.infer<
  typeof pensionValidation.createPension.body
>;

export type PensionParams = z.infer<
  typeof pensionValidation.pensionParams.params
>;
