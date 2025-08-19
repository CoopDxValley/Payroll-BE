import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

// Helper method to get active employee shift
const getActiveEmployeeShift = async (employeeId: string) => {
  return prisma.employeeShift.findFirst({
    where: {
      employeeId,
      isActive: true, // Active assignment
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
          patternDays: true,
        },
      },
    },
  });
};

// Helper method to get employee shift history
const getEmployeeShiftHistory = async (employeeId: string) => {
  return prisma.employeeShift.findMany({
    where: { employeeId },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
          patternDays: true,
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
};

const assignShiftToEmployee = async (data: {
  employeeId: string;
  shiftId: string;
  startDate?: Date;
  endDate?: Date;
  companyId: string;
}) => {
  const { employeeId, shiftId, startDate, endDate, companyId } = data;

  // ✅ Step 1: Required field validation
  if (!employeeId || !shiftId ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "employeeId, shiftId, and startDate are required"
    );
  }

  // ✅ Step 2: Verify employee exists and belongs to company
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  // ✅ Step 3: Verify shift exists and belongs to company
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId, isActive: true },
    include: {
      patternDays: true,
    },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // ✅ Step 4: Check if employee already has an active shift assignment
  const existingAssignment = await getActiveEmployeeShift(employeeId);

  if (existingAssignment) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Employee already has an active shift assignment. Please unassign the current shift first."
    );
  }

  // ✅ Step 5: Create the shift assignment
  return prisma.employeeShift.create({
    data: {
      employeeId,
      shiftId,
      startDate: new Date(),
      endDate: endDate ? new Date(endDate) : null,
      isActive: true, // New assignments are always active
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
          patternDays: true,
        },
      },
    },
  });
};

const unassignShiftFromEmployee = async (
  employeeId: string,
  shiftId: string,
  companyId: string
) => {
  // ✅ Step 1: Verify employee exists and belongs to company
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  // ✅ Step 2: Verify shift exists and belongs to company
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId, isActive: true },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // ✅ Step 3: Find the active shift assignment
  const employeeShift = await prisma.employeeShift.findFirst({
    where: {
      employeeId,
      shiftId,
      isActive: true, // Active assignment
    },
  });

  if (!employeeShift) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No active shift assignment found for this employee and shift"
    );
  }

  // ✅ Step 4: End the assignment by setting endDate and isActive
  return prisma.employeeShift.update({
    where: { id: employeeShift.id },
    data: {
      endDate: new Date(), // Set end date to current date
      isActive: false, // Mark as inactive
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
          patternDays: true,
        },
      },
    },
  });
};

const getEmployeeShifts = async (companyId: string, employeeId?: string) => {
  const where: any = {
    employee: {
      companyId,
    },
    shift: {
      companyId,
      isActive: true,
    },
    isActive: true, // Only get active assignments
  };

  if (employeeId) {
    where.employeeId = employeeId;
  }

  return prisma.employeeShift.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
          patternDays: true,
        },
      },
    },
    orderBy: [{ employeeId: "asc" }, { startDate: "desc" }],
  });
};

const getEmployeeShiftById = async (id: string) => {
  return prisma.employeeShift.findUnique({
    where: { id },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          company: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
          patternDays: true,
          company: true,
        },
      },
    },
  });
};

// New method to get shift details with pattern information
const getShiftDetails = async (shiftId: string, companyId: string) => {
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId, isActive: true },
    include: {
      patternDays: {
        orderBy: { dayNumber: "asc" },
      },
    },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  return shift;
};

// New method to calculate working hours for a specific date range
const calculateWorkingHours = async (
  employeeId: string,
  startDate: Date,
  endDate: Date
) => {
  const employeeShift = await getActiveEmployeeShift(employeeId);
  
  if (!employeeShift) {
    throw new ApiError(httpStatus.NOT_FOUND, "No active shift found for employee");
  }

  const { shift } = employeeShift;
  
  if (shift.shiftType === "FIXED_WEEKLY" && shift.patternDays) {
    // Calculate working hours based on pattern days
    const workingDays = shift.patternDays.filter(day => day.dayType !== "REST_DAY");
    const totalWorkingHours = workingDays.reduce((total, day) => {
      if (day.dayType === "FULL_DAY") {
        const start = new Date(day.startTime);
        const end = new Date(day.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      } else if (day.dayType === "HALF_DAY") {
        const start = new Date(day.startTime);
        const end = new Date(day.endTime);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + (hours / 2);
      }
      return total;
    }, 0);

    return {
      shiftType: shift.shiftType,
      totalWorkingHours,
      workingDays: workingDays.length,
      patternDays: shift.patternDays,
    };
  } else {
    // For ROTATING shifts, return basic info
    return {
      shiftType: shift.shiftType,
      message: "Working hours calculation not available for rotating shifts",
    };
  }
};

export default {
  assignShiftToEmployee,
  unassignShiftFromEmployee,
  getEmployeeShifts,
  getEmployeeShiftById,
  getActiveEmployeeShift,
  getEmployeeShiftHistory,
  getShiftDetails,
  calculateWorkingHours,
};
