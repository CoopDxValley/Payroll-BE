import httpStatus from "http-status";
import {
  Employee,
  EmployeeDepartmentHistory,
  EmployeePositionHistory,
  Prisma,
} from "@prisma/client";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import {
  CreateEmployeeServiceInput,
  EmployeeSearchQuery,
  GeneratePasswordInput,
  getEmployeesQuery,
} from "./employee.type";
import { generateRandomPassword, generateUsername } from "../../utils/helper";
import config from "../../config/config";
import { encryptPassword } from "../../utils/encryption";
// import * as roleService from "../role/role.services";
import departmentService from "../department/department.service";
import exclude from "../../utils/exclude";
import { generateEmployeeIdNumber } from "../../utils/fetch-id-format";
import positionService from "../position/position.service";
import gradeService from "../grades/grade.service";

/**
 * Create an Employee
 */
const createEmployee = async (
  data: CreateEmployeeServiceInput
): Promise<Employee> => {
  const { companyId, personalInfo, payrollInfo, emergencyContacts } = data;

  // Generate username & password
  const username = await generateUsername(personalInfo.name);
  const rawPassword =
    config.env === "development"
      ? "SuperSecurePassword@123"
      : generateRandomPassword();
  const hashedPassword = await encryptPassword(rawPassword);

  // Fetch required references in parallel (1 query instead of 6)
  const [company, department, position, grade] = await Promise.all([
    // prisma.role.findUnique({ where: { id: payrollInfo.roleId } }),
    prisma.company.findUnique({ where: { id: companyId } }),
    prisma.department.findUnique({ where: { id: payrollInfo.departmentId } }),
    prisma.position.findUnique({ where: { id: payrollInfo.positionId } }),
    prisma.grade.findUnique({ where: { id: payrollInfo.gradeId } }),
  ]);

  // Validate references
  // if (!role) throw new ApiError(httpStatus.BAD_REQUEST, "Role not found");
  if (!company) throw new ApiError(httpStatus.BAD_REQUEST, "Company not found");
  if (!department)
    throw new ApiError(httpStatus.BAD_REQUEST, "Department not found");
  if (!position)
    throw new ApiError(httpStatus.BAD_REQUEST, "Position not found");
  if (!grade) throw new ApiError(httpStatus.BAD_REQUEST, "Grade not found");

  // Salary range check
  if (
    payrollInfo.basicSalary < grade.minSalary ||
    payrollInfo.basicSalary > grade.maxSalary
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Basic salary must be between ${grade.minSalary} and ${grade.maxSalary}`
    );
  }

  // Generate EmployeeId number
  const employeeIdNumber = await generateEmployeeIdNumber({
    companyId,
    departmentCode: department.shorthandRepresentation,
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Create Employee
      const employee = await tx.employee.create({
        data: {
          ...personalInfo,
          password: hashedPassword,
          username,
          companyId,
          employeeIdNumber,
        },
      });

      // Create PayrollInfo + Emergency Contacts in parallel
      const { positionId, gradeId, departmentId, ...restPayrollInfo } =
        payrollInfo;
      await Promise.all([
        tx.payrollInfo.create({
          data: {
            ...restPayrollInfo,
            employeeId: employee.id,
          },
        }),
        emergencyContacts.length > 0
          ? tx.emergencyContact.createMany({
              data: emergencyContacts.map((c) => ({
                ...c,
                employeeId: employee.id,
              })),
            })
          : Promise.resolve(),
      ]);

      // Assign relationships (better to keep these in DB relations, but if service needed:)
      await Promise.all([
        // roleService.assignRoleToEmployee(employee.id, payrollInfo.roleId, tx),
        departmentService.assignDepartmentToEmployee(
          employee.id,
          payrollInfo.departmentId,
          tx
        ),
        gradeService.assignGradeToEmployee(
          employee.id,
          payrollInfo.gradeId,
          tx
        ),
        positionService.assignPositionToEmployee(
          employee.id,
          payrollInfo.positionId,
          tx
        ),
      ]);

      return employee;
    });

    return result;
  } catch (err: any) {
    console.log(err);
    if (err.code === "P2002") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `${err.target} already exists`
      );
    }
    throw err;
  }
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
  id: string,
  tx: Prisma.TransactionClient = prisma
): Promise<Pick<Employee, Key> | null> => {
  return tx.employee.findUnique({
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
 * Query for employees with pagination and sorting
 * @param {Object} filter - Prisma filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
export const queryEmployee = async (
  companyId: string,
  options: getEmployeesQuery
) => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 10;
  const skip = (page - 1) * limit;
  const sortBy = options.sortBy;
  const sortType = options.sortType ?? "desc";
  const shiftType = options.type;

  // Build where clause
  let whereClause: any = { companyId };

  // If shift type filter is provided, join with EmployeeShift
  if (shiftType) {
    whereClause.employeeShifts = {
      some: {
        shift: {
          shiftType: shiftType,
        },
      },
    };
  }

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        gender: true,
        employeeIdNumber: true,
        deviceUserId: true,
        positionHistory: {
          where: { toDate: null },
          select: {
            position: { select: { id: true, positionName: true } },
          },
        },
        gradeHistory: {
          where: { toDate: null },
          select: {
            grade: { select: { name: true } },
          },
        },
        employeeShifts: {
          select: {
            shift: {
              select: {
                id: true,
                name: true,
                shiftType: true,
              },
            },
          },
        },
      },
      skip,
      take: parseInt(limit.toString()),
      orderBy: sortBy ? { [sortBy]: sortType } : undefined,
    }),
    prisma.employee.count({ where: whereClause }),
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

  if (!employee) {
    return null;
  }

  return exclude(employee, ["password"]);
};

const assignEmployeeToDepartment = async (
  employeeId: string,
  departmentId: string
): Promise<EmployeeDepartmentHistory> => {
  await prisma.employeeDepartmentHistory.updateMany({
    where: { employeeId, toDate: null },
    data: { toDate: new Date() },
  });

  // Create new department assignment
  return prisma.employeeDepartmentHistory.create({
    data: {
      employeeId,
      departmentId,
      fromDate: new Date(),
    },
  });
};

const assignEmployeeToPosition = async (
  employeeId: string,
  positionId: string
): Promise<EmployeePositionHistory> => {
  await prisma.employeePositionHistory.updateMany({
    where: { employeeId, toDate: null },
    data: { toDate: new Date() },
  });

  // Create new position assignment
  return prisma.employeePositionHistory.create({
    data: {
      employeeId,
      positionId,
      fromDate: new Date(),
    },
  });
};

const generatePassword = async (data: GeneratePasswordInput): Promise<void> => {
  const { email, employeeId } = data;
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  const rawPassword =
    config.env === "development"
      ? "SuperSecurePassword@123"
      : generateRandomPassword();
  const hashedPassword = await encryptPassword(rawPassword);

  await prisma.employee.update({
    where: { id: employeeId },
    data: { password: hashedPassword, email },
  });
};

async function searchEmployees({ keyword, page, limit }: EmployeeSearchQuery) {
  const normalizedKeyword = keyword.trim();
  const checkPage = page ?? 1;
  const checkLimit = limit ?? 10;
  const skip = (checkPage - 1) * checkLimit;

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where: {
        OR: [
          { phoneNumber: { contains: normalizedKeyword, mode: "insensitive" } },
          { name: { contains: normalizedKeyword, mode: "insensitive" } },
        ],
      },
      skip,
      take: checkLimit,
      orderBy: { name: "asc" },
    }),
    prisma.employee.count({
      where: {
        OR: [
          { phoneNumber: { contains: normalizedKeyword, mode: "insensitive" } },
          { name: { contains: normalizedKeyword, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  return { data, total, page, limit };
}

async function getEmployeeHistory(employeeId: string) {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    select: {
      gradeHistory: true,
      positionHistory: true,
      roleHistory: true,
      departmentHistory: true,
    },
  });
}

export default {
  createEmployee,
  getEmployeeById,
  getEmployeeByUsername,
  getEmployeePermissions,
  queryEmployee,
  getEmployeeInfoById,
  assignEmployeeToDepartment,
  assignEmployeeToPosition,
  generatePassword,
  searchEmployees,
  getEmployeeHistory,
};
