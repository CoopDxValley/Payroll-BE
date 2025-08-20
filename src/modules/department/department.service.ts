import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import employeeServices from "../employee/employee.services";
import {
  createDepartmentInput,
  getDepartmentByIdParams,
  updateDepartmentBody,
} from "./department.type";
import { Prisma } from "@prisma/client";

const createDepartment = async (
  data: createDepartmentInput & { companyId: string }
) => {
  const { deptName, location, shorthandRepresentation, companyId } = data;

  const existing = await prisma.department.findFirst({
    where: {
      deptName: deptName.trim(),
      companyId,
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Department already exists in this company"
    );
  }

  // Create the department
  return prisma.department.create({
    data: {
      deptName: deptName.trim(),
      shorthandRepresentation: shorthandRepresentation?.trim(),
      location: location?.trim() || undefined,
      companyId,
    },
  });
};

const getAllDepartments = async (companyId: string) => {
  return await prisma.department.findMany({
    where: {
      companyId: companyId,
      isActive: true,
    }, // or true, depending on your needs
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getDepartmentById = async (
  id: getDepartmentByIdParams["id"],
  tx: Prisma.TransactionClient = prisma
) => {
  return tx.department.findUnique({
    where: { id },
    include: {
      company: true,
    },
  });
};

const updateDepartment = async (id: string, data: updateDepartmentBody) => {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  return prisma.department.update({
    where: { id },
    data,
  });
};

const deleteDepartment = async (id: string) => {
  const existing = await prisma.department.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  return prisma.department.update({
    where: { id },
    data: { isActive: false },
  });
};

/**
 * Assign department to employee
 * @param {string} employeeId
 * @param {string} departmentId
 * @returns {Promise<string | null>}
 */
const assignDepartmentToEmployee = async (
  employeeId: string,
  departmentId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> => {
  const user = await employeeServices.getEmployeeById(employeeId, tx);
  const department = await getDepartmentById(departmentId, tx);

  if (!user || !department) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Department or Employee not found"
    );
  }
  const existing = await tx.employeeDepartmentHistory.findUnique({
    where: {
      employeeId_departmentId: { employeeId, departmentId },
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee already has this department."
    );
  }

  await tx.employeeDepartmentHistory.create({
    data: { employeeId, departmentId, fromDate: new Date() },
  });

  return "Department assigned to employee successfully";
};

export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  assignDepartmentToEmployee,
  // getDepartmentsByCenter,
};
