import { z } from "zod";
import { createEmployeeSchema } from "./employee.validation";

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type CreateEmployeeServiceInput = CreateEmployeeInput & {
  companyId: string;
};
