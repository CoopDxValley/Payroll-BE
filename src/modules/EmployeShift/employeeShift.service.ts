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

// Bulk assign shift to multiple employees
const bulkAssignShiftToEmployees = async (data: {
  shiftId: string;
  employeeIds: string[];
  startDate?: Date;
  endDate?: Date;
  companyId: string;
}) => {
  const { shiftId, employeeIds, startDate, endDate, companyId } = data;

  // Validate input
  if (!shiftId || !employeeIds || employeeIds.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "shiftId and employeeIds array are required"
    );
  }

  if (employeeIds.length > 100) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Maximum 100 employees can be assigned at once"
    );
  }

  // Verify shift exists and belongs to company
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId, isActive: true },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // Verify all employees exist and belong to company
  const employees = await prisma.employee.findMany({
    where: { 
      id: { in: employeeIds },
      companyId 
    },
    select: { id: true, name: true }
  });

  if (employees.length !== employeeIds.length) {
    const foundIds = employees.map(emp => emp.id);
    const missingIds = employeeIds.filter(id => !foundIds.includes(id));
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Some employees not found: ${missingIds.join(', ')}`
    );
  }

  // Check for existing active assignments
  const existingAssignments = await prisma.employeeShift.findMany({
    where: {
      employeeId: { in: employeeIds },
      isActive: true,
    },
    select: { employeeId: true, employee: { select: { name: true } } }
  });

  if (existingAssignments.length > 0) {
    const employeeNames = existingAssignments.map(assignment => assignment.employee.name).join(', ');
    throw new ApiError(
      httpStatus.CONFLICT,
      `Some employees already have active shift assignments: ${employeeNames}`
    );
  }

  // Set startDate to today if not provided, don't set endDate
  const assignmentStartDate = startDate || new Date();

  // Bulk create assignments
  const assignments = await prisma.employeeShift.createMany({
    data: employeeIds.map(employeeId => ({
      employeeId,
      shiftId,
      startDate: assignmentStartDate,
      endDate: null, // Don't set endDate
      isActive: true,
    })),
  });

  return {
    message: `${assignments.count} employees assigned to shift successfully`,
    count: assignments.count,
    shiftName: shift.name,
    employees: employees.map(emp => ({ id: emp.id, name: emp.name })),
  };
};

// Bulk unassign shift from multiple employees
const bulkUnassignShiftFromEmployees = async (data: {
  shiftId: string;
  employeeIds: string[];
  companyId: string;
}) => {
  const { shiftId, employeeIds, companyId } = data;

  // Validate input
  if (!shiftId || !employeeIds || employeeIds.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "shiftId and employeeIds array are required"
    );
  }

  if (employeeIds.length > 1000) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Maximum 1000 employees can be unassigned at once"
    );
  }

  // Verify shift exists and belongs to company
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // Find existing assignments
  const existingAssignments = await prisma.employeeShift.findMany({
    where: {
      employeeId: { in: employeeIds },
      shiftId,
      isActive: true,
    },
    include: {
      employee: { select: { id: true, name: true } }
    }
  });

  if (existingAssignments.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No active assignments found for the specified employees and shift"
    );
  }

  // Bulk deactivate assignments
  const deactivatedAssignments = await prisma.employeeShift.updateMany({
    where: {
      employeeId: { in: employeeIds },
      shiftId,
      isActive: true,
    },
    data: {
      isActive: false,
      endDate: new Date(),
    },
  });

  return {
    message: `${deactivatedAssignments.count} employees unassigned from shift successfully`,
    count: deactivatedAssignments.count,
    shiftName: shift.name,
    unassignedEmployees: existingAssignments.map(assignment => ({
      id: assignment.employee.id,
      name: assignment.employee.name,
    })),
  };
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
  bulkAssignShiftToEmployees,
  bulkUnassignShiftFromEmployees,
};
