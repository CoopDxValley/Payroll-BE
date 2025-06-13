import { z } from "zod";
import {
  createRoleSchema,
  assignPermissionsToRoleSchema,
  createPermissionsToRoleSchema,
  assignRoleToEmployeeSchema,
} from "./role.validation";

export type createRoleInput = z.infer<typeof createRoleSchema.body>;
export type assignPermissionsToRoleInput = z.infer<
  typeof assignPermissionsToRoleSchema.body
>;

export type createAssignPermissionToRolesInput = z.infer<
  typeof createPermissionsToRoleSchema.body
>;

export type assignRoleToEmployeeInput = z.infer<
  typeof assignRoleToEmployeeSchema.body
>;
