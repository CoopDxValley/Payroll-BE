import httpStatus from "http-status";
import { Role } from "@prisma/client";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import * as employeeService from "../employee/employee.services";
import { invalidateUserPermissionCache } from "../../middlewares/check-permissions";

/**
 * Get role by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Role, Key> | null>}
 */
const getRoleById = async <Key extends keyof Role>(
  id: string,
  keys: Key[] = ["id", "name", "createdAt", "updatedAt"] as Key[]
): Promise<Pick<Role, Key> | null> => {
  return prisma.role.findUnique({
    where: { id },
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
  roleId: string
): Promise<string> => {
  const user = await employeeService.getEmployeeById(employeeId);
  const role = await getRoleById(roleId);

  if (!user || !role) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role or Employee not found");
  }
  const existing = await prisma.employeeRole.findUnique({
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

  await prisma.employeeRole.create({
    data: { employeeId, roleId },
  });

  invalidateUserPermissionCache(employeeId);

  return "Role assigned to employee successfully";
};
