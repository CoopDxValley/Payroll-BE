import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import { AuthEmployee } from "../auth/auth.type";
import * as roleService from "./role.services";
import {
  assignPermissionsToRoleInput,
  assignRoleToEmployeeInput,
  createAssignPermissionToRolesInput,
  createRoleInput,
} from "./role.type";

export const createRole = catchAsync(async (req, res) => {
  const input: createRoleInput = req.body;
  const authEmployee = req.employee as AuthEmployee;
  const role = await roleService.createRole(input.name, authEmployee.companyId);
  res
    .status(httpStatus.CREATED)
    .send({ data: role, message: "Role Created Successfully" });
});

export const getRoles = catchAsync(async (req, res) => {
  const roles = await roleService.getRoles();
  res
    .status(httpStatus.OK)
    .send({ data: roles, message: "Roles retrieved successfully" });
});

export const getAllPermissions = catchAsync(async (req, res) => {
  const permissions = await roleService.getAllPermissions();
  res
    .status(httpStatus.OK)
    .send({ data: permissions, message: "Permissions retrieved successfully" });
});

export const assignPermissionToRoles = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const input: assignPermissionsToRoleInput = req.body;
  const assignedPermission = await roleService.assignPermissionToRoles(
    roleId,
    input.permissions
  );
  res.status(httpStatus.OK).send({ data: [], message: assignedPermission });
});

export const createAssignPermissionToRoles = catchAsync(async (req, res) => {
  const input: createAssignPermissionToRolesInput = req.body;
  const authEmployee = req.user as AuthEmployee;
  const assignedPermissionToRole =
    await roleService.createAssignPermissionToRoles(
      input.name,
      input.permissions,
      authEmployee.companyId
    );
  res
    .status(httpStatus.OK)
    .send({ data: [], message: assignedPermissionToRole });
});

export const updatePermissionFromRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  const input: assignPermissionsToRoleInput = req.body;
  const assignedPermission = await roleService.updatePermissionFromRole(
    roleId,
    input.permissions
  );
  res.status(httpStatus.OK).send({ data: [], message: assignedPermission });
});

export const assignRoleToEmployee = catchAsync(async (req, res) => {
  const { employeeId, roleId }: assignRoleToEmployeeInput = req.body;
  const assignedRoleToUser = await roleService.assignRoleToEmployee(
    employeeId,
    roleId
  );
  res.status(httpStatus.OK).send({ data: [], message: assignedRoleToUser });
});

export const revokeRoleFromEmployee = catchAsync(async (req, res) => {
  const { employeeId, roleId }: assignRoleToEmployeeInput = req.body;
  const revokeRoleFromEmployee = await roleService.revokeRoleFromEmployee(
    employeeId,
    roleId
  );
  res.status(httpStatus.OK).send({ data: [], message: revokeRoleFromEmployee });
});

export const getRoleWithOutPermission = catchAsync(async (req, res) => {
  const authEmployee = req.user as AuthEmployee;
  const result = await roleService.getRoleWithOutPermission(
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .send({ data: result, message: "Role retrieved successfully" });
});
