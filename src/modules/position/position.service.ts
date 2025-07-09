import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

const createPosition = async (data: {
  positionName: string;
  description?: string;
  companyId: string;
}) => {
  const { positionName, description, companyId } = data;

  console.log(companyId);
  console.log("ddkdfkdkdk");

  if (!companyId || typeof companyId !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid companyId is required");
  }

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

const getAllPositions = async (companyId?: string) => {
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
      employeePositions: true,
    },
  });
};

const updatePosition = async (
  id: string,
  data: Partial<{
    positionName: string;
    description?: string;
    companyId?: string;
    isActive?: boolean;
  }>
) => {
  if (data.positionName) {
    const duplicate = await prisma.position.findFirst({
      where: {
        positionName: data.positionName,
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
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
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
