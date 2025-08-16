import { z } from "zod";
import idFormatValidation from "./Idformat.validation";

export type CreateIdFormatInput = z.infer<
  typeof idFormatValidation.createIdFormat.body
>;
export type UpdateIdFormatParams = z.infer<
  typeof idFormatValidation.updateIdFormat.params
>;
export type UpdateIdFormatBody = z.infer<
  typeof idFormatValidation.updateIdFormat.body
>;
export type GetOrDeleteIdFormatParams = z.infer<
  typeof idFormatValidation.getOrDeleteIdFormat.params
>;
