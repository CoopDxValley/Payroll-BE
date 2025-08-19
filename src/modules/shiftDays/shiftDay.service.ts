import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import { CreateShiftData, UpdateShiftData } from "./shift.types";

const createShift = async (data: CreateShiftData) => {
  const { name, shiftType, companyId, patternDays } = data;

  if (!name || !shiftType || !companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  // For FIXED_WEEKLY shifts, patternDays are required
  if (shiftType === "FIXED_WEEKLY" && (!patternDays || patternDays.length === 0)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Pattern days are required for FIXED_WEEKLY shifts");
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
      shiftType,
      companyId,
      patternDays: shiftType === "FIXED_WEEKLY" ? {
        create: patternDays!.map(day => ({
          dayNumber: day.dayNumber,
          dayType: day.dayType,
          startTime: day.startTime,
          endTime: day.endTime,
          breakTime: day.breakTime,
          gracePeriod: day.gracePeriod,
        }))
      } : undefined,
    },
    include: {
      patternDays: true,
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

const updateShift = async (id: string, data: UpdateShiftData) => {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // If updating pattern days, first delete existing ones and then create new ones
  if (data.patternDays && existing.shiftType === "FIXED_WEEKLY") {
    await prisma.shiftDay.deleteMany({
      where: { shiftId: id }
    });
  }

  return prisma.shift.update({ 
    where: { id }, 
    data: {
      ...data,
      patternDays: data.patternDays ? {
        create: data.patternDays.map(day => ({
          dayNumber: day.dayNumber,
          dayType: day.dayType,
          startTime: day.startTime,
          endTime: day.endTime,
          breakTime: day.breakTime,
          gracePeriod: day.gracePeriod,
        }))
      } : undefined,
    },
    include: {
      patternDays: true,
    },
  });
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
