 import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import {
  CreateRotatingShiftTypeRequest,
  UpdateRotatingShiftTypeRequest,
  RotatingShiftTypeWithRelations,
  RotatingShiftTypeFilters,
  IRotatingShiftTypeService,
} from "./rotatingShiftType.type";

// Helper function to calculate duration in hours between two time strings
const calculateDuration = (startTime: string, endTime: string): number => {
  const [startHours, startMinutes, startSeconds] = startTime.split(':').map(Number);
  const [endHours, endMinutes, endSeconds] = endTime.split(':').map(Number);
  
  let startTotalMinutes = startHours * 60 + startMinutes + startSeconds / 60;
  let endTotalMinutes = endHours * 60 + endMinutes + endSeconds / 60;
  
  // Handle overnight shifts (end time is next day)
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Add 24 hours
  }
  
  return Math.round((endTotalMinutes - startTotalMinutes) / 60 * 100) / 100; // Round to 2 decimal places
};

// Helper function to format response with company relations
const formatResponse = (shiftType: any): RotatingShiftTypeWithRelations => {
  return {
    ...shiftType,
    company: {
      id: shiftType.company.id,
      companyCode: shiftType.company.companyCode,
    },
    _count: shiftType._count,
  };
};

const createRotatingShiftType = async (
  data: CreateRotatingShiftTypeRequest & { companyId: string }
): Promise<RotatingShiftTypeWithRelations> => {
  const { name, startTime, endTime, companyId } = data;

  // Check if shift type with same name already exists for this company
  const existing = await prisma.rotatingShiftType.findFirst({
    where: { name, companyId, isActive: true },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Rotating shift type with this name already exists");
  }

  // Calculate duration
  const duration = calculateDuration(startTime, endTime);

  const result = await prisma.rotatingShiftType.create({
    data: {
      name,
      startTime,
      endTime,
      duration,
      companyId,
    },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      _count: {
        select: {
          employeeShiftAssignments: true,
        },
      },
    },
  });

  return formatResponse(result);
};

const getRotatingShiftTypes = async (
  companyId: string,
  filters?: RotatingShiftTypeFilters
): Promise<RotatingShiftTypeWithRelations[]> => {
  const where: any = { companyId };

  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters?.name) {
    where.name = {
      contains: filters.name,
      mode: 'insensitive',
    };
  }

  const shiftTypes = await prisma.rotatingShiftType.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
    //   _count: {
    //     select: {
    //       employeeShiftAssignments: true,
    //     },
    //   },
    },
    // orderBy: { createdAt: "desc" },
  });

  return shiftTypes.map(formatResponse);
};

const getRotatingShiftTypeById = async (
  id: string,
  companyId: string
): Promise<RotatingShiftTypeWithRelations> => {
  const shiftType = await prisma.rotatingShiftType.findFirst({
    where: { id, companyId },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      _count: {
        select: {
          employeeShiftAssignments: true,
        },
      },
    },
  });

  if (!shiftType) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rotating shift type not found");
  }

  return formatResponse(shiftType);
};

const updateRotatingShiftType = async (
  id: string,
  companyId: string,
  data: UpdateRotatingShiftTypeRequest
): Promise<RotatingShiftTypeWithRelations> => {
  // Check if shift type exists
  const existing = await prisma.rotatingShiftType.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rotating shift type not found");
  }

  // If updating name, check for duplicates
  if (data.name && data.name !== existing.name) {
    const duplicate = await prisma.rotatingShiftType.findFirst({
      where: { name: data.name, companyId, isActive: true, id: { not: id } },
    });

    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "Rotating shift type with this name already exists");
    }
  }

  // Calculate new duration if times are being updated
  let duration = existing.duration;
  if (data.startTime || data.endTime) {
    const startTime = data.startTime || existing.startTime;
    const endTime = data.endTime || existing.endTime;
    duration = calculateDuration(startTime, endTime);
  }

  const result = await prisma.rotatingShiftType.update({
    where: { id },
    data: {
      ...data,
      duration,
    },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      _count: {
        select: {
          employeeShiftAssignments: true,
        },
      },
    },
  });

  return formatResponse(result);
};

const deleteRotatingShiftType = async (
  id: string,
  companyId: string
): Promise<{ message: string }> => {
  // Check if shift type exists
  const existing = await prisma.rotatingShiftType.findFirst({
    where: { id, companyId },
    include: {
      _count: {
        select: {
          employeeShiftAssignments: true,
        },
      },
    },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rotating shift type not found");
  }

  // Check if shift type is being used
  if (existing._count.employeeShiftAssignments > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot delete rotating shift type that is currently assigned to employees"
    );
  }

  // Soft delete by setting isActive to false
  await prisma.rotatingShiftType.update({
    where: { id },
    data: { isActive: false },
  });

  return { message: "Rotating shift type deleted successfully" };
};

const deactivateRotatingShiftType = async (
  id: string,
  companyId: string
): Promise<RotatingShiftTypeWithRelations> => {
  const existing = await prisma.rotatingShiftType.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rotating shift type not found");
  }

  if (!existing.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Rotating shift type is already deactivated");
  }

  const result = await prisma.rotatingShiftType.update({
    where: { id },
    data: { isActive: false },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      _count: {
        select: {
          employeeShiftAssignments: true,
        },
      },
    },
  });

  return formatResponse(result);
};

const activateRotatingShiftType = async (
  id: string,
  companyId: string
): Promise<RotatingShiftTypeWithRelations> => {
  const existing = await prisma.rotatingShiftType.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Rotating shift type not found");
  }

  if (existing.isActive) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Rotating shift type is already active");
  }

  const result = await prisma.rotatingShiftType.update({
    where: { id },
    data: { isActive: true },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      _count: {
        select: {
          employeeShiftAssignments: true,
        },
      },
    },
  });

  return formatResponse(result);
};

const rotatingShiftTypeService: IRotatingShiftTypeService = {
  createRotatingShiftType,
  getRotatingShiftTypes,
  getRotatingShiftTypeById,
  updateRotatingShiftType,
  deleteRotatingShiftType,
  deactivateRotatingShiftType,
  activateRotatingShiftType,
};

export default rotatingShiftTypeService; 