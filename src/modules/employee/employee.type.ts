import { z } from "zod";
import {
  assignEmployeeToDepartmentSchema,
  assignEmployeeToPositionSchema,
  createEmployeeSchema,
  employeeSearchSchema,
  generatePasswordSchema,
  getEmployeeSchema,
  getEmployeesSchema,
} from "./employee.validation";

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type CreateEmployeeServiceInput = CreateEmployeeInput & {
  companyId: string;
};
export type getEmployeesQuery = z.infer<typeof getEmployeesSchema.query>;
export type GetEmployeeInfoByIdParams = z.infer<
  typeof getEmployeeSchema.params
>;
export type AssignEmployeeToDepartmentBody = z.infer<
  typeof assignEmployeeToDepartmentSchema.body
>;
export type AssignEmployeeToPositionBody = z.infer<
  typeof assignEmployeeToPositionSchema.body
>;

export type GeneratePasswordInput = z.infer<typeof generatePasswordSchema>;

export type EmployeeSearchQuery = z.infer<typeof employeeSearchSchema.query>;
