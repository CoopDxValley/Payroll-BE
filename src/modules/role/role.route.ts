import express from "express";
import roleController from "./role.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  assignPermissionsToRoleSchema,
  createPermissionsToRoleSchema,
  assignRoleToEmployeeSchema,
  createRoleSchema,
  updateRole,
  removeRole,
} from "./role.validation";
import {
  createRoleInput,
  assignPermissionsToRoleInput,
  createAssignPermissionToRolesInput,
  assignRoleToEmployeeInput,
  assignPermissionsToRoleParams,
  updateRoleParams,
  updateRoleInput,
} from "./role.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, createRoleInput>(createRoleSchema),
    roleController.createRole
  )
  .get(auth(), roleController.getRoles);

router.get("/all/permissions", auth(), roleController.getAllPermissions);

router
  .route("/:roleId")
  .get(
    auth(),
    validate<assignPermissionsToRoleParams, never, never>(removeRole),
    roleController.getRoleById
  )
  .post(
    auth(),
    validate<updateRoleParams, never, updateRoleInput>(updateRole),
    roleController.updateRole
  );

router.post(
  "/assign/permission",
  auth(),
  validate<never, never, createAssignPermissionToRolesInput>(
    createPermissionsToRoleSchema
  ),
  roleController.createAssignPermissionToRoles
);

router.post(
  "/update-role-permissions/:roleId",
  auth(),
  validate<assignPermissionsToRoleParams, never, assignPermissionsToRoleInput>(
    assignPermissionsToRoleSchema
  ),
  roleController.updatePermissionFromRole
);

router.post(
  "/assign-role-to-employee",
  auth(),
  validate<never, never, assignRoleToEmployeeInput>(assignRoleToEmployeeSchema),
  roleController.assignRoleToEmployee
);

router.post(
  "/revoke-role-from-employee",
  auth(),
  validate<never, never, assignRoleToEmployeeInput>(assignRoleToEmployeeSchema),
  roleController.revokeRoleFromEmployee
);

router.post(
  "/remove-role/:roleId",
  auth(),
  validate<updateRoleParams, never, never>(removeRole),
  roleController.removeRole
);

router.post(
  "/assign/permission/:roleId",
  auth(),
  validate<assignPermissionsToRoleParams, never, assignPermissionsToRoleInput>(
    assignPermissionsToRoleSchema
  ),
  roleController.assignPermissionToRoles
);

export default router;
