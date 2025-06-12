// validations/company.validation.ts
import { z } from "zod";

export const createCompanySchema = z.object({
  email: z.string().email().optional(),
  organizationName: z.string().min(1, "Organization name is required"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  companyCode: z.string().min(1, "Company code is required"),
  notes: z.string().optional(),
});

export const createCompanyValidation = {
  body: createCompanySchema,
};
