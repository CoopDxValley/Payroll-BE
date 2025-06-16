import { z } from "zod";

// Reusable salary schema
const salaryField = z
  .union([z.string().transform((val) => Number(val)), z.number()])
  .refine((val) => !isNaN(val) && val > 0, {
    message: "Salary must be a positive number",
  });

// Create schema with cross-field validation
export const createGradeSchema = z
  .object({
    name: z.string().min(1, "Grade name is required"),
    minSalary: salaryField,
    maxSalary: salaryField,
    companyId: z.string().uuid("Invalid company ID"),
  })
  .refine((data) => data.maxSalary > data.minSalary, {
    message: "Maximum salary must be greater than minimum salary",
    path: ["maxSalary"],
  });

// Update schema — all fields optional, but min < max still enforced when both provided
export const updateGradeSchema = z
  .object({
    name: z.string().min(1).optional(),
    minSalary: salaryField.optional(),
    maxSalary: salaryField.optional(),
    companyId: z.string().uuid("Invalid company ID").optional(),
  })
  .refine(
    (data) =>
      data.minSalary === undefined ||
      data.maxSalary === undefined ||
      data.maxSalary > data.minSalary,
    {
      message: "Maximum salary must be greater than minimum salary",
      path: ["maxSalary"],
    }
  );

// Types
export type CreateGradeDto = z.infer<typeof createGradeSchema>;
export type UpdateGradeDto = z.infer<typeof updateGradeSchema>;
