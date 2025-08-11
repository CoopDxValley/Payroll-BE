import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import { CreatePositionInput, UpdatePositionInput } from "./position.type";

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

const getPositionById = async (id: string) => {
  return prisma.position.findUnique({
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
export default {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
};
