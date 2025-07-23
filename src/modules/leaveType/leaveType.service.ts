import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

const createLeaveType = async (data: {
  name: string;
  description?: string;
  maxDaysYearly: number;
  isPaid?: boolean;
  carryForward?: boolean;
}) => {
  const { name, description, maxDaysYearly, isPaid, carryForward } = data;

  if (!name) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Leave type name is required");
  }

  return prisma.leaveType.create({
    data: {
      name: name.trim(),
      description: description?.trim(),
      maxDaysYearly,
      isPaid: isPaid ?? true,
      carryForward: carryForward ?? false,
    },
  });
};

const getAllLeaveTypes = async () => {
  return prisma.leaveType.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

const getLeaveTypeById = async (id: string) => {
  return prisma.leaveType.findUnique({ where: { id } });
};

const updateLeaveType = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    maxDaysYearly: number;
    isPaid: boolean;
    carryForward: boolean;
  }>
) => {
  const existing = await prisma.leaveType.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Leave type not found");
  }

  return prisma.leaveType.update({
    where: { id },
    data,
  });
};

const deleteLeaveType = async (id: string) => {
  const existing = await prisma.leaveType.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Leave type not found");
  }

  return prisma.leaveType.update({
    where: { id },
    data: { isActive: false },
  });
};

export default {
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
};
