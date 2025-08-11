import { z } from "zod";
import { amount, safeName, UUID } from "../../validations/security";

const createGrade = {
  body: z
    .object({
      name: safeName,
      minSalary: amount,
      maxSalary: amount,
    })
    .strict(),
};

const updateGrade = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
  body: z
    .object({
      name: safeName.optional(),
      minSalary: amount.optional(),
      maxSalary: amount.optional(),
      isActive: z.boolean().optional(),
    })
    .strict(),
};

const getGrade = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
};

export default {
  createGrade,
  updateGrade,
  getGrade,
};
