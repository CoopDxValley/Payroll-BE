import {
  EmploymentStatus,
  EmploymentType,
  Gender,
  IdType,
  PayFrequency,
} from "@prisma/client";
import { z } from "zod";
import {
  email,
  phoneNumber,
  safeName,
  safeText,
  safeUsername,
  UUID,
} from "../../validations/security";

const personalInfoSchema = z
  .object({
    name: safeName,
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    dateOfBirth: z.coerce.date(),
    username: safeUsername,
    email: email.optional(),
    phoneNumber,
    optionalPhoneNumber: phoneNumber.optional(),
    employeeIdNumber: safeName.optional(),
    nationality: safeName.optional().default("Ethiopia"),
    imageUrl: safeName.url().optional(),
    status: z
      .enum([
        EmploymentStatus.ACTIVE,
        EmploymentStatus.INACTIVE,
        EmploymentStatus.TERMINATED,
        EmploymentStatus.ON_LEAVE,
        EmploymentStatus.RETIRED,
      ])
      .optional(),
    idNumber: safeName.optional(),
    idImageUrl: safeName.url().optional(),
    idType: z
      .enum([IdType.NATIONALID, IdType.PASSPORT, IdType.LICENSE, IdType.KEBELE])
      .optional()
      .default(IdType.KEBELE),
  })
  .strict();

export const payrollInfoSchema = z
  .object({
    tinNumber: safeName.min(5),
    basicSalary: z.coerce.number().positive(),
    currency: safeName.min(2).default("ETB"),

    employmentType: z.enum([
      EmploymentType.CONTRACT,
      EmploymentType.HOURLY,
      EmploymentType.PERMANENT,
    ]),
    payFrequency: z
      .enum([
        PayFrequency.MONTHLY,
        PayFrequency.BIWEEKLY,
        PayFrequency.WEEKLY,
        PayFrequency.DAILY,
      ])
      .default(PayFrequency.MONTHLY),

    positionId: UUID,
    roleId: UUID,
    departmentId: UUID,
    gradeId: UUID,
  })
  .strict();

export const emergencyContactSchema = z
  .object({
    fullName: safeName,
    relationship: safeName,
    phone: phoneNumber,
    email: email.optional(),
    address: safeText.optional(),
  })
  .strict();

export const emergencyContactsSchema = z.array(emergencyContactSchema).min(1);

export const createEmployeeSchema = z
  .object({
    personalInfo: personalInfoSchema,
    payrollInfo: payrollInfoSchema,
    emergencyContacts: emergencyContactsSchema,
  })
  .strict();

export const getEmployeesSchema = {
  query: z
    .object({
      sortBy: z.string().optional(),
      sortType: z.enum(["asc", "desc"]).optional(),
      limit: z.coerce.number().int().optional(),
      page: z.coerce.number().int().optional(),
    })
    .strict(),
};

export const getEmployeeSchema = {
  params: z
    .object({
      employeeId: z.string().min(1, "Employee ID is required"),
    })
    .strict(),
};

export const assignEmployeeToDepartmentSchema = {
  body: z
    .object({
      employeeId: z.string().min(1, "Employee ID is required"),
      departmentId: z.string().min(1, "Department ID is required"),
    })
    .strict(),
};

export const assignEmployeeToPositionSchema = {
  body: z
    .object({
      employeeId: z.string().min(1, "Employee ID is required"),
      positionId: z.string().min(1, "Position ID is required"),
    })
    .strict(),
};

export const generatePasswordSchema = z
  .object({
    email,
    employeeId: UUID,
  })
  .strict();

export const createEmployeeValidation = { body: createEmployeeSchema };

export const employeeSearchSchema = {
  query: z
    .object({
      keyword: z.string().min(1, "Keyword is required").trim(),
      page: z.coerce.number().int().positive().default(1).optional(),
      limit: z.coerce.number().int().positive().max(100).default(10).optional(),
    })
    .strict(),
};
