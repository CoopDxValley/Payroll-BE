import { z } from "zod";
import {
  createRoleSchema,
  assignPermissionsToRoleSchema,
  createPermissionsToRoleSchema,
  assignRoleToEmployeeSchema,
  updateRole,
} from "./role.validation";

export type createRoleInput = z.infer<typeof createRoleSchema.body>;
export type assignPermissionsToRoleParams = z.infer<
  typeof assignPermissionsToRoleSchema.params
>;
export type assignPermissionsToRoleInput = z.infer<
  typeof assignPermissionsToRoleSchema.body
>;

export type createAssignPermissionToRolesInput = z.infer<
  typeof createPermissionsToRoleSchema.body
>;

export type assignRoleToEmployeeInput = z.infer<
  typeof assignRoleToEmployeeSchema.body
>;

export type updateRoleInput = z.infer<typeof updateRole.body>;
export type updateRoleParams = z.infer<typeof updateRole.params>;
