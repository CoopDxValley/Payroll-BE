import { z } from "zod";
import { safeName, UUID } from "../../validations/security";

const createDepartment = {
  body: z
    .object({
      deptName: safeName,
      location: safeName.optional(),
      shorthandRepresentation: safeName.optional(),
    })
    .strict(),
};

const getDepartmentById = {
  params: z
    .object({
      id: UUID,
    })
    .strict(),
};

const updateDepartment = {
  params: getDepartmentById.params,
  body: z
    .object({
      deptName: safeName.optional(),
      location: safeName.optional(),
      shorthandRepresentation: safeName.optional(),
    })
    .strict(),
};

export default {
  createDepartment,
  getDepartmentById,
  updateDepartment,
};
