import { z } from "zod";
import { UUID } from "../../validations/security";

export const createPayrollSchema = {
  body: z
    .object({
      payrollDefinitionId: UUID,
      employeeIds: z.array(UUID).min(1, "At least one employee Id is required"),
    })
    .strict(),
};

export const getPayrollByPayrollDefinitionIdSchema = {
  params: z.object({
    id: UUID,
  }),
};

export const getNonPayrollEmployeeSchema = {
  query: z.object({
    id: UUID,
  }),
};
