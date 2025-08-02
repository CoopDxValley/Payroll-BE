import { z } from "zod";
import departmentValidation from "./department.validation";

export type createDepartmentInput = z.infer<
  typeof departmentValidation.createDepartment.body
>;

export type getDepartmentByIdParams = z.infer<
  typeof departmentValidation.getDepartmentById.params
>;

export type updateDepartmentParams = z.infer<
  typeof departmentValidation.updateDepartment.params
>;
export type updateDepartmentBody = z.infer<
  typeof departmentValidation.updateDepartment.body
>;
