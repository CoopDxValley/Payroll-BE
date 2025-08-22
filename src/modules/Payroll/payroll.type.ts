import { z } from "zod";
import { Prisma } from "@prisma/client";
import {
  createPayrollSchema,
  getNonPayrollEmployeeSchema,
  getPayrollByPayrollDefinitionIdSchema,
} from "./payroll.validation";

export type createPayrollInput = z.infer<typeof createPayrollSchema.body>;

/** Use this in queries so the runtime shape matches the compile-time type */
export const employeeForPayrollInclude = {
  payrollInfo: true,
  gradeHistory: { where: { toDate: null } }, // filter at query time
  additionalPays: true,
  additionalDeductions: true,
} satisfies Prisma.EmployeeInclude;

/** Strongly-typed employee with the relations we need */
export type EmployeeForPayroll = Prisma.EmployeeGetPayload<{
  include: typeof employeeForPayrollInclude;
}>;

export type getPayrollByPayrollDefinitionId = z.infer<
  typeof getPayrollByPayrollDefinitionIdSchema.params
>;

export type getNonPayrollEmployee = z.infer<
  typeof getNonPayrollEmployeeSchema.query
>;
