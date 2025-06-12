import { z } from "zod";

export const createEmployeeSchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
  name: z.string().min(1, "Name is required"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
  companyId: z.string().min(1, "Company ID is required"),
  departmentId: z.string().min(1, "Department ID is required"),
  positionId: z.string().min(1, "Position ID is required"),
});

export const createEmployeeValidation = {
  body: createEmployeeSchema,
};
