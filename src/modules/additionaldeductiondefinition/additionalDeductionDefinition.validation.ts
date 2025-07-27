import { z } from "zod";

const commonBody = z.object({
  name: z.string().trim(),
  type: z.enum(["AMOUNT", "PERCENT"]),
});

const create = {
  body: commonBody,
};

const update = {
  params: z.object({
    id: z.string().uuid(),
  }),
  body: commonBody,
};

const getById = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export default {
  create,
  update,
  getById,
};
