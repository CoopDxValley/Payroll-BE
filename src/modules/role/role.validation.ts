import { z } from "zod";

export const assignPermissionsToRoleSchema = {
  params: z.object({
    roleId: z.string().uuid().min(1, "Role ID is required"),
  }),
  body: z.object({
    permissions: z
      .array(z.string().uuid().min(1, "Permission ID is required"))
      .min(1, "At least one permission must be assigned"),
  }),
};

export const createPermissionsToRoleSchema = {
  body: z.object({
    name: z.string().min(1, "Name is required"),
    permissions: z
      .array(z.string().uuid().min(1, "Permission ID is required"))
      .min(1, "At least one permission must be assigned"),
  }),
};

export const assignRoleToEmployeeSchema = {
  body: z.object({
    employeeId: z.string().min(1, "User ID is required"),
    roleId: z.string().min(1, "Role ID is required"),
  }),
};

export const createRoleSchema = {
  body: z.object({
    name: z.string().min(1, "Role name is required"),
  }),
};
