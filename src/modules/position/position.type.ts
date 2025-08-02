import { z } from "zod";
import positionValidation from "./position.validation";

export type CreatePositionInput = z.infer<
  typeof positionValidation.createPosition.body
>;
export type UpdatePositionInput = z.infer<
  typeof positionValidation.updatePosition.body
>;
export type UpdatePositionParams = z.infer<
  typeof positionValidation.updatePosition.params
>;
export type GetOrDeletePositionParams = z.infer<
  typeof positionValidation.getOrDeletePosition.params
>;
