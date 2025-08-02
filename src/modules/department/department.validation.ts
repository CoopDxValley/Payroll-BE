import { z } from "zod";

const createDepartment = {
  body: z.object({
    deptName: z.string().trim().min(3, "dept name is required"),
    location: z.string().trim().optional(),
    shorthandRepresentation: z.string().trim().optional(),
  }),
};

const getDepartmentById = {
  params: z.object({
    id: z.string().uuid(),
  }),
};

const updateDepartment = {
  params: getDepartmentById.params,
  body: z.object({
    deptName: z.string().trim().optional(),
    location: z.string().trim().optional(),
    shorthandRepresentation: z.string().trim().optional(),
  }),
};

export default {
  createDepartment,
  getDepartmentById,
  updateDepartment,
};
