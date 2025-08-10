import { z } from "zod";

export const createPayrollDefinitionSchema = z
  .object({
    payrollName: z.string().min(2, "Payroll name is required"),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    payPeriod: z.string().min(2, "Pay period is required"),
    payDate: z.coerce.date(),
  })
  .refine((v) => v.endDate >= v.startDate, {
    message: "endDate must be on or after startDate",
    path: ["endDate"],
  });

export const createPayrollDefinitionBulkSchema = z
  .array(createPayrollDefinitionSchema)
  .min(1, "At least one payroll definition is required");

export const updatePayrollDefinitionSchema = z
  .object({
    payrollName: z.string().min(2).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.string().optional(),
  })
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
  id: z.string().uuid("Invalid ID"),
});
