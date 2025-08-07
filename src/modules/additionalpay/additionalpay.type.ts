import { z } from "zod";
import {
  createAdditionalPaySchema,
  updateAdditionalPaySchema,
  getAdditionalPayByIdSchema,
} from "./additionalpay.validation";

export type CreateAdditionalPayInput = z.infer<
  typeof createAdditionalPaySchema.body
>;
export type UpdateAdditionalPayInput = z.infer<
  typeof updateAdditionalPaySchema.body
>;

export type UpdateAdditionalPayParams = z.infer<
  typeof updateAdditionalPaySchema.params
>;

export type GetAdditionalPayByIdParams = z.infer<
  typeof getAdditionalPayByIdSchema.params
>;
