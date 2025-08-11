// validations/company.validation.ts
import { z } from "zod";

export const createCompanySchema = z.object({
  email: z.string().email().optional(),
  organizationName: z.string().min(1, "Organization name is required"),
  phoneNumber: z.string().regex(/^\d{10}$/, "Phone number must be 10 digits."),
  companyCode: z.string().min(1, "Company code is required"),
  notes: z.string().optional(),
});

export const updateCompanySchema = z.object({
  email: z.string().email().optional(),
  organizationName: z
    .string()
    .min(1, "Organization name is required")
    .optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, {
      message:
        "Please enter a valid phone number (10–15 digits, optional + prefix).",
    })
    .optional(),
  companyCode: z.string().optional(),
  notes: z.string().optional(),
});

export const createCompanyValidation = {
  body: createCompanySchema,
};

export const updateCompanyValidation = {
  body: updateCompanySchema,
};
