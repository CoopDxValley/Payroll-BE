import httpStatus from "http-status";
import { Permission, Prisma, Role } from "@prisma/client";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import employeeService from "../employee/employee.services";
import { invalidateUserPermissionCache } from "../../middlewares/check-permissions";
import { validatePermission } from "../../utils/validate-permissions";
import {
  assignPermissionsToRoleInput,
  createAssignPermissionToRolesInput,
  createRoleInput,
  updateRoleInput,
} from "./role.type";

/**
 * Create role
 * @param {Object} name
 * @returns {Promise<Role>}
 */
export const createRole = async (
  data: createRoleInput,
  companyId: string
): Promise<Role> => {
  if (await getRoleByName(data.name)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role already defined");
  }

  return prisma.role.create({
    data: {
      name: data.name,
      companyId,
    },
  });
};

/**
 * Get all roles
 * @returns {Promise<Role[] | null>}
 */
export const getRoles = async (companyId: string): Promise<Role[] | null> => {
  const roles = await prisma.role.findMany({
    where: { companyId, isActive: true },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  return roles;
};

/**
 * Get all permissions
 * @returns {Promise<Permission[] | null>}
 */
export const getAllPermissions = async (): Promise<Permission[] | null> => {
  const permissions = await prisma.permission.findMany();
  return permissions;
};

/**
 * Get role by name
 * @param {string} name
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
export const getRoleByName = async <Key extends keyof Role>(
  name: string,
  keys: Key[] = ["id", "name", "createdAt", "updatedAt"] as Key[]
): Promise<Pick<Role, Key> | null> => {
  return prisma.role.findUnique({
    where: { name },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Role, Key> | null>;
};

/**
 * Get role by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
export const getRoleById = async <Key extends keyof Role>(
  id: string,
  tx: Prisma.TransactionClient = prisma,
  keys: Key[] = ["id", "name", "createdAt", "updatedAt"] as Key[]
): Promise<Pick<Role, Key> | null> => {
  return tx.role.findUnique({
    where: { id, isActive: true },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Role, Key> | null>;
};

/**
 * Assign permissions to
 * @param {string} employeeId
 * @param {string} roleId
 * @returns {Promise<string | null>}
 */
export const assignRoleToEmployee = async (
  employeeId: string,
  roleId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> => {
  const user = await employeeService.getEmployeeById(employeeId, tx);
  const role = await getRoleById(roleId, tx);

  if (!user || !role) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role or Employee not found");
  }
  const existing = await tx.employeeRoleHistory.findUnique({
    where: {
      employeeId_roleId: { employeeId, roleId },
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee already has this role."
    );
  }

  await tx.employeeRoleHistory.create({
    data: { employeeId, roleId, fromDate: new Date() },
  });

  invalidateUserPermissionCache(employeeId);

  return "Role assigned to employee successfully";
};

/**
 * Assign permissions to
 * @param {string} roleId
 * @param {Array<String>} permissions
 * @returns {Promise<Pick<RolePermission, Key> | null>}
 */
export const assignPermissionToRoles = async (
  roleId: string,
  permissions: assignPermissionsToRoleInput["permissions"]
): Promise<string> => {
  if (!(await getRoleById(roleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  }
  // 2. Validate all permissionIds exist
  const existingPermissions = await prisma.permission.findMany({
    where: { id: { in: permissions } },
    select: { id: true },
  });

  const existingIds = new Set(existingPermissions.map((p) => p.id));
  const invalidIds = permissions.filter((id) => !existingIds.has(id));

  if (invalidIds.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some permissionIds do not exist"
    );
  }

  await validatePermission(permissions);
  // Create new permission assignments
  const rolePermissions = permissions.map((permissionId: string) => ({
    roleId,
    permissionId,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true, // just in case
  });
  return "Permissions assigned to role successfully";
};

/**
 * revoke permissions from role
 * @param {string} roleId
 * @param {Array<String>} permissions
 * @returns {Promise<string | null>}
 */
export const updatePermissionFromRole = async (
  roleId: string,
  permissions: assignPermissionsToRoleInput["permissions"]
): Promise<string> => {
  if (!(await getRoleById(roleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  }

  // 2. Validate all permissionIds exist
  const existingPermissions = await prisma.permission.findMany({
    where: { id: { in: permissions } },
    select: { id: true },
  });

  const existingIds = new Set(existingPermissions.map((p) => p.id));
  const invalidIds = permissions.filter((id) => !existingIds.has(id));

  if (invalidIds.length > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some permissionIds do not exist"
    );
  }

  await prisma.rolePermission.deleteMany({
    where: {
      roleId,
    },
  });

  const newPermissions = permissions.map((permissionId) => ({
    roleId,
    permissionId,
  }));

  if (newPermissions.length > 0) {
    await prisma.rolePermission.createMany({
      data: newPermissions,
      skipDuplicates: true,
    });
  }

  return "Permissions updated from role successfully";
};

/**
 * Assign permissions to
 * @param {string} name
 * @param {Array<String>} permissions
 * @returns {Promise<string | null>}
 */
export const createAssignPermissionToRoles = async (
  name: createAssignPermissionToRolesInput["name"],
  permissions: createAssignPermissionToRolesInput["permissions"],
  companyId: string
): Promise<string> => {
  await validatePermission(permissions);

  const role = await createRole({ name }, companyId);

  const rolePermissions = permissions.map((permissionId) => ({
    roleId: role.id,
    permissionId,
  }));

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });

  return "Permissions assigned to role successfully";
};

/**
 * revoke roles from employee
 * @param {string} employeeId
 * @param {string} roleId
 * @returns {Promise<string | null>}
 */
export const revokeRoleFromEmployee = async (
  employeeId: string,
  roleId: string
): Promise<string> => {
  const employee = await employeeService.getEmployeeById(employeeId);
  const role = await getRoleById(roleId);

  if (!employee || !role) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role or Employee not found");
  }

  const existing = await prisma.employeeRoleHistory.findUnique({
    where: {
      employeeId_roleId: { employeeId, roleId },
    },
  });

  if (!existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee does not have this role."
    );
  }

  await prisma.employeeRoleHistory.update({
    where: {
      employeeId_roleId: { employeeId, roleId },
    },
    data: {
      toDate: new Date(),
    },
  });

  invalidateUserPermissionCache(employeeId);

  return "Role removed from employee successfully";
};

export const getRoleWithOutPermission = async (companyId: string) => {
  const result = await prisma.role.findMany({
    where: { companyId, isActive: true },
    select: {
      id: true,
      name: true,
    },
  });

  return result;
};

export const updateRole = async (
  roleId: string,
  data: updateRoleInput
): Promise<Role> => {
  if (!(await getRoleById(roleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  }

  return prisma.role.update({
    where: { id: roleId },
    data,
  });
};

export const removeRole = async (roleId: string): Promise<void> => {
  if (!(await getRoleById(roleId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  }

  await prisma.role.update({
    where: { id: roleId },
    data: { isActive: false },
  });

  await prisma.employeeRoleHistory.updateMany({
    where: { roleId },
    data: {
      toDate: new Date(),
    },
  });
};
