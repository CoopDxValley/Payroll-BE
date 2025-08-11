import {
  EmploymentStatus,
  EmploymentType,
  Gender,
  IdType,
  PayFrequency,
} from "@prisma/client";
import { z } from "zod";

const personalInfoSchema = z.object({
  name: z.string().min(3),
  gender: z.enum([Gender.MALE, Gender.FEMALE]),
  dateOfBirth: z.coerce.date(),
  username: z.string().min(3, "Username must be at least 3 characters long"),
  email: z.string().email("Invalid email format").optional(),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." }),
  optionalPhoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Phone number must be 10 digits." })
    .optional(),
  // password: z
  //   .string()
  //   .min(8, "Password must be at least 8 characters long.")
  //   .max(128, "Password must be at most 128 characters long.")
  //   .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  //   .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  //   .regex(/[0-9]/, "Password must contain at least one number.")
  //   .regex(
  //     /[^A-Za-z0-9]/,
  //     "Password must contain at least one special character."
  //   )
  //   .refine((val) => !/\s/.test(val), {
  //     message: "Password must not contain spaces.",
  //   }),
  employeeIdNumber: z.string().optional(),
  nationality: z.string().optional().default("Ethiopia"),
  imageUrl: z.string().url().optional(),
  status: z
    .enum([
      EmploymentStatus.ACTIVE,
      EmploymentStatus.INACTIVE,
      EmploymentStatus.TERMINATED,
      EmploymentStatus.ON_LEAVE,
      EmploymentStatus.RETIRED,
    ])
    .optional(),
  idNumber: z.string().optional(),
  idImageUrl: z.string().url().optional(),
  idType: z
    .enum([IdType.NATIONALID, IdType.PASSPORT, IdType.LICENSE, IdType.KEBELE])
    .optional()
    .default(IdType.KEBELE),
});

export const payrollInfoSchema = z.object({
  tinNumber: z.string().min(5),
  basicSalary: z.coerce.number().positive(),
  currency: z.string().min(2).default("ETB"),

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

  positionId: z.string().uuid(),
  roleId: z.string().uuid(),
  departmentId: z.string().uuid(),
  gradeId: z.string().uuid(),
});

export const emergencyContactSchema = z.object({
  fullName: z.string().min(3),
  relationship: z.string().min(2),
  phone: z.string().min(7).max(20),
  email: z.string().email().optional(),
  address: z.string().optional(),
});

export const emergencyContactsSchema = z.array(emergencyContactSchema).min(1);

export const createEmployeeSchema = z.object({
  personalInfo: personalInfoSchema,
  payrollInfo: payrollInfoSchema,
  emergencyContacts: emergencyContactsSchema,
});

export const getEmployeesSchema = {
  query: z.object({
    sortBy: z.string().optional(),
    sortType: z.enum(["asc", "desc"]).optional(),
    limit: z.coerce.number().int().optional(),
    page: z.coerce.number().int().optional(),
  }),
};

export const getEmployeeSchema = {
  params: z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
  }),
};

export const assignEmployeeToDepartmentSchema = {
  body: z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    departmentId: z.string().min(1, "Department ID is required"),
  }),
};

export const assignEmployeeToPositionSchema = {
  body: z.object({
    employeeId: z.string().min(1, "Employee ID is required"),
    positionId: z.string().min(1, "Position ID is required"),
  }),
};

export const createEmployeeValidation = { body: createEmployeeSchema };
