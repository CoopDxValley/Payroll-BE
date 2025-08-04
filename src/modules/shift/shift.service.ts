import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

const createShift = async (data: {
  name: string;
  cycleDays: number;
  companyId: string;
}) => {
  const { name, cycleDays, companyId } = data;

  if (!name || !cycleDays || !companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  const existing = await prisma.shift.findFirst({
    where: { name, companyId, isActive: true },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Shift already exists");
  }

  return prisma.shift.create({
    data: {
      name,
      cycleDays,
      companyId,
    },
  });
};

const getAllShifts = async (companyId: string) => {
  return prisma.shift.findMany({
    where: { companyId, isActive: true },
    include: {
      patternDays: true,
      employeeShifts: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getShiftById = async (id: string) => {
  return prisma.shift.findUnique({
    where: { id },
    include: {
      patternDays: true,
      employeeShifts: true,
      company: true,
    },
  });
};

const updateShift = async (
  id: string,
  data: Partial<{ name: string; cycleDays: number }>
) => {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  return prisma.shift.update({ where: { id }, data });
};

const deleteShift = async (id: string) => {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  return prisma.shift.update({
    where: { id },
    data: { isActive: false },
  });
};

export default {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
};
