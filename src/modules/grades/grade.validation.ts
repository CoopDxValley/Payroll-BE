import { z } from "zod";

const createGrade = {
  body: z.object({
    name: z.string().trim(),
    minSalary: z.number().positive(),
    maxSalary: z.number().positive(),
  }),
};

const updateGrade = {
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().trim(),
    minSalary: z.number().positive(),
    maxSalary: z.number().positive(),
    isActive: z.boolean(),
  }),
};

const getGrade = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

const deleteGrade = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

export default {
  createGrade,
  updateGrade,
  getGrade,
  deleteGrade,
};
