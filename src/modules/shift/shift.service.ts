// import { PrismaClient } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import prisma from "../../client";

// const prisma = new PrismaClient();

const createShift = async (shiftData: any, companyId: string) => {
  const shift = await prisma.shift.create({
    data: {
      ...shiftData,
      companyId,
    },
  });
  return shift;
};

const getShifts = async (companyId: string) => {
  const shifts = await prisma.shift.findMany({
    where: {
      companyId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return shifts;
};

const getShiftById = async (id: string, companyId: string) => {
  const shift = await prisma.shift.findFirst({
    where: {
      id,
      companyId,
      isActive: true,
    },
  });
  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }
  return shift;
};

const updateShift = async (id: string, companyId: string, updateData: any) => {
  const shift = await prisma.shift.findFirst({
    where: {
      id,
      companyId,
      isActive: true,
    },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  const updatedShift = await prisma.shift.update({
    where: { id },
    data: updateData,
  });

  return updatedShift;
};

const deleteShift = async (id: string, companyId: string) => {
  const shift = await prisma.shift.findFirst({
    where: {
      id,
      companyId,
      isActive: true,
    },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // Soft delete by setting isActive to false
  const deletedShift = await prisma.shift.update({
    where: { id },
    data: { isActive: false },
  });

  return deletedShift;
};

export default {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
};
