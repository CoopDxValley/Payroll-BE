import { z } from "zod";
import { safeName, UUID } from "../../validations/security";

export const assignPermissionsToRoleSchema = {
  params: z
    .object({
      roleId: UUID,
    })
    .strict(),
  body: z
    .object({
      permissions: z
        .array(UUID)
        .min(1, "At least one permission must be assigned"),
    })
    .strict(),
};

export const createPermissionsToRoleSchema = {
  body: z
    .object({
      name: safeName,
      permissions: z
        .array(UUID)
        .min(1, "At least one permission must be assigned"),
    })
    .strict(),
};

export const assignRoleToEmployeeSchema = {
  body: z
    .object({
      employeeId: UUID,
      roleId: UUID,
    })
    .strict(),
};

export const createRoleSchema = {
  body: z
    .object({
      name: safeName,
    })
    .strict(),
};

export const updateRole = {
  params: z
    .object({
      roleId: UUID,
    })
    .strict(),
  body: z
    .object({
      name: safeName,
    })
    .strict(),
};

export const removeRole = {
  params: z
    .object({
      roleId: UUID,
    })
    .strict(),
};
