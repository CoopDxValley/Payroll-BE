import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import employeeServices from "../employee/employee.services";

const createDepartment = async (data: {
  deptName: string;
  location?: string;
  shorthandRepresentation?: string;
  companyId: string; // assuming UUID based on your Position model
}) => {
  const { deptName, location, shorthandRepresentation, companyId } = data;

  // Validate deptName
  if (!deptName || typeof deptName !== "string" || !deptName.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Department name is required");
  }

  // Validate shorthandRepresentation

  // Validate companyId
  if (!companyId || typeof companyId !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid companyId is required");
  }

  // Check for duplicate department in the same company
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

const getAllDepartments = async (companyId?: string) => {
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

const getDepartmentById = async (id: string) => {
  return prisma.department.findUnique({
    where: { id },
    include: {
      company: true,
      // departmentEmployees: true,
    },
  });
};

const updateDepartment = async (
  id: string,
  data: Partial<{
    deptName: string;
    location: string;
    shorthandRepresentation: string;
    companyId: string;
  }>
) => {
  //   if (data.deptName) {
  //     const duplicate = await prisma.department.findFirst({
  //       where: {
  //         deptName: data.deptName,
  //         NOT: { id }, // exclude current department
  //       },
  //     });
  //     if (duplicate) {
  //       throw new ApiError(httpStatus.CONFLICT, "Department name must be unique");
  //     }
  //   }
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
  departmentId: string
): Promise<string> => {
  const user = await employeeServices.getEmployeeById(employeeId);
  const department = await getDepartmentById(departmentId);

  if (!user || !department) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Department or Employee not found"
    );
  }
  const existing = await prisma.employeeDepartmentHistory.findUnique({
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

  await prisma.employeeDepartmentHistory.create({
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
