import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import { CreatePositionInput, UpdatePositionInput } from "./position.type";
import employeeServices from "../employee/employee.services";
import { Prisma } from "@prisma/client";

const createPosition = async (
  data: CreatePositionInput & { companyId: string }
) => {
  const existing = await prisma.position.findFirst({
    where: {
      positionName: data.positionName,
      companyId: data.companyId,
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Position already exists in this company"
    );
  }

  return prisma.position.create({ data });
};

const getAllPositions = async (companyId: string) => {
  return prisma.position.findMany({
    where: { isActive: true, companyId: companyId },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getPositionById = async (
  id: string,
  tx: Prisma.TransactionClient = prisma
) => {
  return tx.position.findUnique({
    where: { id },
    include: {
      company: true,
      // employeePositions: true,
    },
  });
};

const updatePosition = async (
  id: string,
  data: UpdatePositionInput & { companyId: string }
) => {
  if (data.positionName) {
    const duplicate = await prisma.position.findFirst({
      where: {
        positionName: data.positionName,
        companyId: data.companyId,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "Position name must be unique");
    }
  }

  const existing = await prisma.position.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
  }

  return prisma.position.update({
    where: { id },
    data,
  });
};

const deletePosition = async (id: string, companyId: string) => {
  const existing = await prisma.position.findUnique({
    where: { id, companyId },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
  }

  return prisma.position.update({
    where: { id },
    data: { isActive: false },
  });
};

/**
 * Assign position to employee
 * @param {string} employeeId
 * @param {string} positionId
 * @returns {Promise<string | null>}
 */
const assignPositionToEmployee = async (
  employeeId: string,
  positionId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<string> => {
  const user = await employeeServices.getEmployeeById(employeeId, tx);
  const position = await getPositionById(positionId, tx);

  if (!user || !position) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Position or Employee not found"
    );
  }
  const existing = await tx.employeePositionHistory.findUnique({
    where: {
      employeeId_positionId: { employeeId, positionId },
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee already has this position."
    );
  }

  await tx.employeePositionHistory.create({
    data: { employeeId, positionId, fromDate: new Date() },
  });

  return "Position assigned to employee successfully";
};

export default {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
  assignPositionToEmployee,
};
