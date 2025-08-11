import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import { AuthEmployee } from "../auth/auth.type";
import * as roleService from "./role.services";
import {
  assignPermissionsToRoleInput,
  assignPermissionsToRoleParams,
  assignRoleToEmployeeInput,
  createAssignPermissionToRolesInput,
  createRoleInput,
  updateRoleInput,
  updateRoleParams,
} from "./role.type";
import { CustomRequest } from "../../middlewares/validate";

const createRole = catchAsync<CustomRequest<never, never, createRoleInput>>(
  async (req: CustomRequest<never, never, createRoleInput>, res: Response) => {
    const input = req.body;
    const authEmployee = req.employee as AuthEmployee;
    const role = await roleService.createRole(input, authEmployee.companyId);
    res
      .status(httpStatus.CREATED)
      .send({ data: role, message: "Role Created Successfully" });
  }
);

const getRoles = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const roles = await roleService.getRoles(authEmployee.companyId);
  res
    .status(httpStatus.OK)
    .send({ data: roles, message: "Roles retrieved successfully" });
});

const getAllPermissions = catchAsync(async (req, res) => {
  const permissions = await roleService.getAllPermissions();
  res
    .status(httpStatus.OK)
    .send({ data: permissions, message: "Permissions retrieved successfully" });
});

const getRoleById = catchAsync<CustomRequest<updateRoleParams, never, never>>(
  async (req: CustomRequest<updateRoleParams, never, never>, res: Response) => {
    const { roleId } = req.params;
    const role = await roleService.getRoleById(roleId);

    res
      .status(httpStatus.OK)
      .send({ data: role, message: "Role retrieved successfully" });
  }
);

const assignPermissionToRoles = catchAsync<
  CustomRequest<
    assignPermissionsToRoleParams,
    never,
    assignPermissionsToRoleInput
  >
>(
  async (
    req: CustomRequest<
      assignPermissionsToRoleParams,
      never,
      assignPermissionsToRoleInput
    >,
    res: Response
  ) => {
    const { roleId } = req.params;
    const input = req.body;
    const assignedPermission = await roleService.assignPermissionToRoles(
      roleId,
      input.permissions
    );
    res.status(httpStatus.OK).send({ data: [], message: assignedPermission });
  }
);

const createAssignPermissionToRoles = catchAsync<
  CustomRequest<never, never, createAssignPermissionToRolesInput>
>(
  async (
    req: CustomRequest<never, never, createAssignPermissionToRolesInput>,
    res: Response
  ) => {
    const input = req.body;
    const authEmployee = req.employee as AuthEmployee;
    const assignedPermissionToRole =
      await roleService.createAssignPermissionToRoles(
        input.name,
        input.permissions,
        authEmployee.companyId
      );
    res
      .status(httpStatus.CREATED)
      .send({ data: [], message: assignedPermissionToRole });
  }
);

const updatePermissionFromRole = catchAsync<
  CustomRequest<
    assignPermissionsToRoleParams,
    never,
    assignPermissionsToRoleInput
  >
>(
  async (
    req: CustomRequest<
      assignPermissionsToRoleParams,
      never,
      assignPermissionsToRoleInput
    >,
    res: Response
  ) => {
    const { roleId } = req.params;
    const input = req.body;
    const assignedPermission = await roleService.updatePermissionFromRole(
      roleId,
      input.permissions
    );
    res.status(httpStatus.OK).send({ data: [], message: assignedPermission });
  }
);

const assignRoleToEmployee = catchAsync<
  CustomRequest<never, never, assignRoleToEmployeeInput>
>(
  async (
    req: CustomRequest<never, never, assignRoleToEmployeeInput>,
    res: Response
  ) => {
    const { employeeId, roleId } = req.body;
    const assignedRoleToUser = await roleService.assignRoleToEmployee(
      employeeId,
      roleId
    );
    res.status(httpStatus.OK).send({ data: [], message: assignedRoleToUser });
  }
);

const revokeRoleFromEmployee = catchAsync<
  CustomRequest<never, never, assignRoleToEmployeeInput>
>(
  async (
    req: CustomRequest<never, never, assignRoleToEmployeeInput>,
    res: Response
  ) => {
    const { employeeId, roleId } = req.body;
    const revokeRoleFromEmployee = await roleService.revokeRoleFromEmployee(
      employeeId,
      roleId
    );
    res
      .status(httpStatus.OK)
      .send({ data: [], message: revokeRoleFromEmployee });
  }
);

const getRoleWithOutPermission = catchAsync(async (req, res) => {
  const authEmployee = req.user as AuthEmployee;
  const result = await roleService.getRoleWithOutPermission(
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .send({ data: result, message: "Role retrieved successfully" });
});

const updateRole = catchAsync<
  CustomRequest<updateRoleParams, never, updateRoleInput>
>(
  async (
    req: CustomRequest<updateRoleParams, never, updateRoleInput>,
    res: Response
  ) => {
    const { roleId } = req.params;
    const input = req.body;
    const result = await roleService.updateRole(roleId, input);

    res
      .status(httpStatus.OK)
      .send({ data: result, message: "Role is updated Successfully" });
  }
);

const removeRole = catchAsync<CustomRequest<updateRoleParams, never, never>>(
  async (req: CustomRequest<updateRoleParams, never, never>, res: Response) => {
    const { roleId } = req.params;

    await roleService.removeRole(roleId);

    res
      .status(httpStatus.OK)
      .send({ data: [], message: "Role is removed successfully" });
  }
);

export default {
  createRole,
  getRoles,
  getAllPermissions,
  assignPermissionToRoles,
  createAssignPermissionToRoles,
  updatePermissionFromRole,
  assignRoleToEmployee,
  revokeRoleFromEmployee,
  getRoleWithOutPermission,
  updateRole,
  removeRole,
  getRoleById,
};
