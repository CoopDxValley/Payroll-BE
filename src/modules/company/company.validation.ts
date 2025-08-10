// validations/company.validation.ts
import { z } from "zod";
import { email, phoneNumber, safeName } from "../../validations/security";

export const createCompanySchema = z
  .object({
    email: email.optional(),
    organizationName: safeName,
    phoneNumber,
    companyCode: safeName,
    notes: safeName.optional(),
  })
  .strict();

export const updateCompanySchema = z
  .object({
    email: email.optional(),
    organizationName: safeName.optional(),
    phoneNumber: phoneNumber.optional(),
    companyCode: safeName.optional(),
    notes: safeName.optional(),
  })
  .strict();

export const createCompanyValidation = {
  body: createCompanySchema,
};

export const updateCompanyValidation = {
  body: updateCompanySchema,
};
