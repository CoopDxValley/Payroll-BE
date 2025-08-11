import { z } from "zod";
import { safeName, safeOptionalText, UUID } from "../../validations/security";

const createPosition = {
  body: z
    .object({
      positionName: safeName,
      description: safeOptionalText,
    })
    .strict(),
};

const getOrDeletePosition = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
};

const updatePosition = {
  params: getOrDeletePosition.params,
  body: z
    .object({
      positionName: safeName.optional(),
      description: safeOptionalText,
    })
    .strict(),
};

export default {
  createPosition,
  updatePosition,
  getOrDeletePosition,
};
