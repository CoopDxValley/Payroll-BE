import { z } from "zod";
import { safeName, UUID } from "../../validations/security";

const commonBody = z
  .object({
    name: safeName,
    type: z.enum(["AMOUNT", "PERCENT"]),
  })
  .strict();

const create = {
  body: commonBody,
};

const update = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
  body: z
    .object({
      name: safeName.optional(),
      type: z.enum(["AMOUNT", "PERCENT"]).optional(),
    })
    .strict(),
};

const getById = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
};

export default {
  create,
  update,
  getById,
};
