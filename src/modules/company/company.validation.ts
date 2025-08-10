// validations/company.validation.ts
import { z } from "zod";
import {
  email,
  phoneNumber,
  safeName,
  safeOptionalText,
} from "../../validations/security";

export const createCompanySchema = z
  .object({
    email: email.optional(),
    organizationName: safeName,
    phoneNumber,
    companyCode: safeName,
    notes: safeOptionalText,
  })
  .strict();

export const updateCompanySchema = z
  .object({
    email: email.optional(),
    organizationName: safeName.optional(),
    phoneNumber: phoneNumber.optional(),
    companyCode: safeName.optional(),
    notes: safeOptionalText,
  })
  .strict();

export const createCompanyValidation = {
  body: createCompanySchema,
};

export const updateCompanyValidation = {
  body: updateCompanySchema,
};
