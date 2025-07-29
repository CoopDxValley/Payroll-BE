import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import { Employee } from "@prisma/client";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import {
  CreateEmployeeInput,
  CreateEmployeeServiceInput,
} from "./employee.type";
import { generateRandomPassword, generateUsername } from "../../utils/helper";
import config from "../../config/config";
import { encryptPassword } from "../../utils/encryption";
import * as roleService from "../role/role.services";
import { accountCreatedMessage } from "../../templates/sms-template";
import { formatPhoneNumberForSms } from "../../utils/format-phone-number";
// import { smsQueue } from "../../queues";
import logger from "../../config/logger";
import { AuthEmployee } from "../auth/auth.type";
import departmentService from "../department/department.service";

/**
 * Create a Employee
 * @param {Object} data - Company data
 * @returns {Promise<Employee>}
 */
const createEmployee = async (
  data: CreateEmployeeServiceInput
): Promise<Employee> => {
  const { companyId, personalInfo, payrollInfo, emergencyContacts } = data;
  const username = await generateUsername(personalInfo.name);
  const rawPassword =
    config.env === "development"
      ? "SuperSecurePassword@123"
      : generateRandomPassword();

  const [role, company, department, position] = await Promise.all([
    prisma.role.findUnique({ where: { id: payrollInfo.roleId } }),
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.department.findUnique({ where: { id: payrollInfo.departmentId } }),
    prisma.position.findUnique({ where: { id: payrollInfo.positionId } }),
  ]);

  if (!role) throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  if (!company) throw new ApiError(httpStatus.BAD_REQUEST, "Company not found");
  if (!department)
    throw new ApiError(httpStatus.BAD_REQUEST, "Department not found");
  if (!position)
    throw new ApiError(httpStatus.BAD_REQUEST, "Position not found");

  const hashedPassword = await encryptPassword(rawPassword);

  const employee = await prisma.employee.create({
    data: {
      ...personalInfo,
      password: hashedPassword,
      username,
      companyId,
    },
  });

  const emergencyContactsData = emergencyContacts.map((contact) => ({
    ...contact,
    employeeId: employee.id,
  }));

  await prisma.emergencyContact.createMany({
    data: emergencyContactsData,
  });

  await roleService.assignRoleToEmployee(employee.id, payrollInfo.roleId);

  await departmentService.assignDepartmentToEmployee(
    employee.id,
    payrollInfo.departmentId
  );

  return employee;
};

/**
 * Get employee by username
 * @param {string} username
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Employee, Key> | null>}
 */
const getEmployeeByUsername = async <Key extends keyof Employee>(
  username: string,
  keys: Key[] = [
    "id",
    "phoneNumber",
    "name",
    "password",
    "username",
    "companyId",
    "createdAt",
    "updatedAt",
  ] as Key[]
): Promise<Pick<Employee, Key> | null> => {
  return prisma.employee.findUnique({
    where: { username },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Employee, Key> | null>;
};

/**
 * Get employee by id
 * @param {string} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Employee, Key> | null>}
 */
const getEmployeeById = async <Key extends keyof Employee>(
  id: string
): Promise<Pick<Employee, Key> | null> => {
  return prisma.employee.findUnique({
    where: { id },
    select: {
      id: true,
      phoneNumber: true,
      name: true,
      username: true,
      gender: true,
    },
    // select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Employee, Key> | null>;
};

/**
 * Get employee's permissions (action_subject strings)
 * @param employeeId
 * @returns Promise<string[]> - array of permission strings in "action_subject" format
 */
const getEmployeePermissions = async (
  employeeId: string
): Promise<string[]> => {
  const employeeRoles = await prisma.employeeRoleHistory.findMany({
    where: { employeeId, toDate: null },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  if (!employeeRoles || employeeRoles.length === 0) return [];
  // Collect all unique permissions from all roles
  const permissions = new Set<string>();
  for (const employeeRole of employeeRoles) {
    for (const rolePermission of employeeRole.role.permissions) {
      permissions.add(rolePermission.permission.action_subject);
    }
  }
  return Array.from(permissions);
};

/**
 * Get employee roles by id
 * @param {string} id
 * @returns {Promise<EmployeeRole[] | null>}
 */
// export const getEmployeeRoleById = async (
//   id: string
// ): Promise<EmployeeRole[] | null> => {
//   return prisma.employeeRole.findMany({
//     where: { employeeId: id },
//   });
// };

/**
 * query employees with id
 * @param {string} id
 * @returns {Promise<AuthEmployee>}
 */
// export const getEmployeeWithRoles = async (
//   id: string
// ): Promise<AuthEmployee> => {
//   const employee = await prisma.employee.findUnique({
//     where: { id },
//     include: {
//       employeeRoles: {
//         include: {
//           role: {
//             include: {
//               permissions: {
//                 include: {
//                   permission: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!employee) throw new ApiError(httpStatus.BAD_REQUEST, "Unauthorized");

//   const permissions = new Set<string>();
//   employee.employeeRoles.forEach((employeeRole) => {
//     employeeRole.role.permissions.forEach((rp) => {
//       permissions.add(`${rp.permission.action}_${rp.permission.subject}`);
//     });
//   });

//   const authEmployee = {
//     id: employee.id,
//     name: employee.name,
//     isSuperAdmin: employee.isSuperAdmin,
//     companyId: employee.companyId,
//     departmentId: employee?.departmentId || "",
//     roles: employee.employeeRoles.map((ur) => ur.role.name),
//     permissions: Array.from(permissions),
//   };

//   return authEmployee;
// };

/**
 * Query for employees with pagination and sorting
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryEmployee = async (
  // filter: object,
  companyId: string,
  options: {
    limit?: string;
    page?: string;
    sortBy?: string;
    sortType?: "asc" | "desc";
  }
) => {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        gender: true,
        employeeIdNumber: true,
        positionHistory: {
          where: { toDate: null },
          select: {
            position: { select: { positionName: true } },
          },
        },
        gradeHistory: {
          where: { toDate: null },
          select: {
            grade: { select: { name: true } },
          },
        },
      },
      skip,
      take: limit,
      orderBy: sortBy ? { [sortBy]: sortType } : undefined,
    }),
    prisma.employee.count(),
  ]);
  const totalPages = Math.ceil(total / limit);
  return {
    employees,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get employee info by ID
 * @param {string} employeeId
 * @returns {Promise<Employee | null>}
 */
const getEmployeeInfoById = async (
  employeeId: string
): Promise<Omit<Employee, "password"> | null> => {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      company: { select: { organizationName: true } },
      payrollInfo: true,
      emergencyContacts: true,
      positionHistory: {
        where: { toDate: null },
        select: {
          position: { select: { positionName: true } },
        },
      },
      gradeHistory: {
        where: { toDate: null },
        select: {
          grade: { select: { name: true } },
        },
      },
      departmentHistory: {
        where: { toDate: null },
        select: {
          department: { select: { deptName: true } },
        },
      },
    },
  });

  return employee;
};

export default {
  createEmployee,
  getEmployeeById,
  getEmployeeByUsername,
  getEmployeePermissions,
  queryEmployee,
  getEmployeeInfoById,
};
