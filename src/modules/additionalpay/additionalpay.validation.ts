import { z } from "zod";

export const createAdditionalPaySchema = {
  body: z.object({
    amount: z.number().positive("Amount must be positive"),
    employeeId: z.string().uuid("Invalid employee ID"),
    additionalPayDefinitionId: z
      .string()
      .uuid("Invalid additional pay definition ID"),
  }),
};

export const getAdditionalPayByIdSchema = {
  params: z.object({
    id: z.string().uuid("Invalid ID"),
  }),
};

export const updateAdditionalPaySchema = {
  body: z.object({
    amount: z.number().positive().optional(),
  }),
  params: getAdditionalPayByIdSchema.params,
};
