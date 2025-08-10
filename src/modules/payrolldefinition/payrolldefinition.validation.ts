import { z } from "zod";
import { safeName, UUID } from "../../validations/security";

export const createPayrollDefinitionSchema = z
  .object({
    payrollName: safeName,
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    payPeriod: safeName,
    payDate: z.coerce.date(),
  })
  .strict()
  .refine((v) => v.endDate >= v.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const createPayrollDefinitionBulkSchema = z
  .array(createPayrollDefinitionSchema)
  .min(1, "At least one payroll definition is required");

export const updatePayrollDefinitionSchema = z
  .object({
    payrollName: safeName.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .strict()
  .refine(
    (v) =>
      !v.startDate ||
      !v.endDate ||
      (v.startDate && v.endDate && v.endDate >= v.startDate),
    {
      message: "endDate must be on or after startDate",
      path: ["endDate"],
    }
  );

export const getPayrollDefinitionByIdSchema = z.object({
  id: UUID,
});
