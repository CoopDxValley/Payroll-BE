import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

// ==================== SHIFT SCHEDULE MANAGEMENT ====================
export const createShiftSchedule = async (data: {
  companyId: string;
  shiftId?: string;
  name: string;
  startDate: string; // incoming JSON string
  endDate: string; // incoming JSON string
}) => {
  const { companyId, shiftId, name, startDate, endDate } = data;

  // Convert strings to Date objects
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Validate date range
  if (start >= end) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Start date must be before end date"
    );
  }

  // Check if shift exists and belongs to company (required)
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId, isActive: true },
  });
  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // Enforce that only ROTATING shifts can be used
  if (shift.shiftType !== "ROTATING") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Only ROTATING shifts can be used with shift schedules"
    );
  }

  // Check for overlapping schedules in the same date range
  const overlappingSchedule = await prisma.shiftSchedule.findFirst({
    where: {
      companyId,
      isActive: true,
      OR: [
        {
          AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
        },
        {
          AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
        },
        {
          AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
        },
      ],
    },
  });

  if (overlappingSchedule) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Schedule overlaps with existing schedule in the same date range"
    );
  }

  // Create the schedule
  return prisma.shiftSchedule.create({
    data: {
      companyId,
      shiftId,
      name,
      startDate: start,
      endDate: end,
      isActive: true,
      isApproved: false,
    },
    include: {
      company: {
        select: { id: true, companyCode: true },
      },
      shift: {
        select: { id: true, name: true, shiftType: true },
      },
    },
  });
};
// const createShiftSchedule = async (data: {
//   companyId: string;
//   shiftId?: string;
//   name: string;
//   startDate: Date;
//   endDate: Date;
// }) => {
//   const { companyId, shiftId, name, startDate, endDate } = data;

//   // Validate date range
//   if (startDate >= endDate) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Start date must be before end date"
//     );
//   }

//   // Check if shift exists and belongs to company (if provided)
//   if (shiftId) {
//     const shift = await prisma.shift.findFirst({
//       where: { id: shiftId, companyId, isActive: true },
//     });
//     if (!shift) {
//       throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
//     }
//   }

//   // Check for overlapping schedules in the same date range
//   const overlappingSchedule = await prisma.shiftSchedule.findFirst({
//     where: {
//       companyId,
//       isActive: true,
//       OR: [
//         {
//           AND: [
//             { startDate: { lte: startDate } },
//             { endDate: { gte: startDate } },
//           ],
//         },
//         {
//           AND: [
//             { startDate: { lte: endDate } },
//             { endDate: { gte: endDate } },
//           ],
//         },
//         {
//           AND: [
//             { startDate: { gte: startDate } },
//             { endDate: { lte: endDate } },
//           ],
//         },
//       ],
//     },
//   });

//   if (overlappingSchedule) {
//     throw new ApiError(
//       httpStatus.CONFLICT,
//       "Schedule overlaps with existing schedule in the same date range"
//     );
//   }
// return prisma.shiftSchedule.create({
//   data: {
//     companyId,
//     shiftId,
//     name,
//     startDate: new Date(startDate),
//     endDate: new Date(endDate),
//     isActive: true,
//     isApproved: false,
//   },
//   include: {
//     company: {
//       select: { id: true, companyCode: true },
//     },
//     shift: {
//       select: { id: true, name: true, shiftType: true },
//     },
//   },
// });
//   // return prisma.shiftSchedule.create({
//   //   data: {
//   //     companyId,
//   //     shiftId,
//   //     name,
//   //     startDate: new Date(startDate),
//   //     endDate: new Date(endDate),
//   //     isActive: true,
//   //     isApproved: false,
//   //   },
//   //   include: {
//   //     company: {
//   //       select: {
//   //         id: true,
//   //         companyCode: true,
//   //       },
//   //     },
//   //     shift: {
//   //       select: {
//   //         id: true,
//   //         name: true,
//   //         shiftType: true,
//   //       },
//   //     },
//   //   },
//   // });

// };

const getShiftSchedules = async (
  companyId: string,
  filters?: {
    isActive?: boolean;
    isApproved?: boolean;
    startDate?: Date;
    endDate?: Date;
  }
) => {
  const where: any = { companyId };

  if (filters?.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters?.isApproved !== undefined) {
    where.isApproved = filters.isApproved;
  }

  if (filters?.startDate) {
    where.startDate = { gte: new Date(filters.startDate) };
  }

  if (filters?.endDate) {
    where.endDate = { lte: new Date(filters.endDate) };
  }

  return prisma.shiftSchedule.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      assignments: {
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });
};

const getShiftScheduleById = async (id: string, companyId: string) => {
  const schedule = await prisma.shiftSchedule.findFirst({
    where: { id, companyId },
    include: {
      company: {
        select: {
          id: true,
          // name: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      assignments: {
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
        },
        orderBy: { date: "asc" },
      },
    },
  });

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift schedule not found");
  }

  return schedule;
};

const updateShiftSchedule = async (
  id: string,
  companyId: string,
  data: {
    name?: string;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }
) => {
  const schedule = await getShiftScheduleById(id, companyId);

  // Prevent updates if schedule is approved
  if (schedule.isApproved) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot update approved schedule"
    );
  }

  // Validate date range if dates are being updated
  if (data.startDate && data.endDate && data.startDate >= data.endDate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Start date must be before end date"
    );
  }

  return prisma.shiftSchedule.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
    },
  });
};

const approveShiftSchedule = async (id: string, companyId: string) => {
  const schedule = await getShiftScheduleById(id, companyId);

  if (schedule.isApproved) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Schedule is already approved");
  }

  // Check if schedule has assignments
  const assignmentCount = await prisma.employeeShiftAssignment.count({
    where: { scheduleId: id },
  });

  if (assignmentCount === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot approve schedule without assignments"
    );
  }

  return prisma.shiftSchedule.update({
    where: { id },
    data: { isApproved: true },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
    },
  });
};
const deleteShiftSchedule = async (id: string, companyId: string) => {
  const schedule = await getShiftScheduleById(id, companyId);

  if (schedule.isApproved) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot delete approved schedule"
    );
  }

  // Check if any employees are assigned
  const assignmentCount = await prisma.employeeShiftAssignment.count({
    where: { scheduleId: id },
  });

  if (assignmentCount > 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot delete schedule: employees are assigned to this schedule"
    );
  }

  // Delete the schedule
  await prisma.shiftSchedule.delete({
    where: { id },
  });

  return { message: "Schedule deleted successfully" };
};

// ==================== EMPLOYEE SHIFT ASSIGNMENT MANAGEMENT ====================

const createEmployeeShiftAssignment = async (data: {
  employeeId: string;
  scheduleId?: string;
  date: string; // Format: "YYYY-MM-DD"
  shiftTypeId?: string; // null = OFF day, uuid = actual shift type
  companyId: string;
}) => {
  const { employeeId, scheduleId, date, shiftTypeId, companyId } = data;

  // Verify employee exists and belongs to company
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
    include: {
      employeeShifts: {
        select: {
          id: true,
          shift: {
            select: {
              id: true,
              shiftType: true,
            },
          },
        },
      },
    },
  });

  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  // Check if employee has a ROTATION shift type
  const hasRotationShift = employee.employeeShifts?.some((employeeShift) => {
    const shiftType = String(employeeShift.shift?.shiftType || "");
    return shiftType.toUpperCase().includes("ROTAT");
  });

  // Debug: Log employee shift information
  console.log(
    "Employee shift types:",
    employee.employeeShifts?.map((es) => es.shift?.shiftType)
  );

  if (!hasRotationShift) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee must have a ROTATION/ROTATING shift type to be assigned rotating shifts"
    );
  }

  // Verify schedule exists and belongs to company (if provided)
  if (scheduleId) {
    const schedule = await prisma.shiftSchedule.findFirst({
      where: { id: scheduleId, companyId },
    });
    if (!schedule) {
      throw new ApiError(httpStatus.NOT_FOUND, "Shift schedule not found");
    }

    // Check if date is within schedule range
    const assignmentDate = new Date(date);
    if (
      assignmentDate < schedule.startDate ||
      assignmentDate > schedule.endDate
    ) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Assignment date is outside schedule range"
      );
    }
  }

  // Check for existing assignment on the same date
  const existingAssignment = await prisma.employeeShiftAssignment.findFirst({
    where: { employeeId, date: new Date(date) },
  });

  if (existingAssignment) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Employee already has an assignment for this date"
    );
  }

  // Calculate hours based on shift type
  let hours = 0;
  if (shiftTypeId) {
    // Get shift type details to calculate hours
    const shiftType = await prisma.rotatingShiftType.findFirst({
      where: { id: shiftTypeId, companyId, isActive: true },
    });

    if (!shiftType) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Shift type not found or inactive"
      );
    }

    hours = shiftType.duration;
  }
  // If shiftTypeId is null, hours remain 0 (OFF day)

  return prisma.employeeShiftAssignment.create({
    data: {
      employeeId,
      scheduleId,
      date: new Date(date),
      shiftTypeId,
      hours,
      isApproved: false,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      schedule: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      },
      RotatingShiftType: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          duration: true,
        },
      },
    },
  });
};

const getEmployeeShiftAssignments = async (
  companyId: string,
  filters?: {
    employeeId?: string;
    scheduleId?: string;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
    shiftTypeId?: string; // Filter by specific shift type
    isApproved?: boolean;
  }
) => {
  const where: any = {
    employee: { companyId },
  };

  if (filters?.employeeId) {
    where.employeeId = filters.employeeId;
  }

  if (filters?.scheduleId) {
    where.scheduleId = filters.scheduleId;
  }

  if (filters?.date) {
    where.date = new Date(filters.date);
  }

  if (filters?.startDate || filters?.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  if (filters?.shiftTypeId) {
    where.shiftTypeId = filters.shiftTypeId;
  }

  if (filters?.isApproved !== undefined) {
    where.isApproved = filters.isApproved;
  }

  return prisma.employeeShiftAssignment.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      schedule: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      },
      RotatingShiftType: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          duration: true,
        },
      },
    },
    orderBy: [{ date: "asc" }, { employeeId: "asc" }],
  });
};

const updateEmployeeShiftAssignment = async (
  id: string,
  companyId: string,
  data: {
    shiftTypeId?: string; // null = OFF day, uuid = actual shift type
  }
) => {
  const assignment = await prisma.employeeShiftAssignment.findFirst({
    where: { id },
    include: {
      employee: { select: { companyId: true } },
    },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  if (assignment.employee.companyId !== companyId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  if (assignment.isApproved) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot update approved assignment"
    );
  }

  // Calculate hours based on shift type
  let hours = 0;
  if (data.shiftTypeId) {
    // Get shift type details to calculate hours
    const shiftType = await prisma.rotatingShiftType.findFirst({
      where: { id: data.shiftTypeId, companyId, isActive: true },
    });

    if (!shiftType) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Shift type not found or inactive"
      );
    }

    hours = shiftType.duration;
  }
  // If shiftTypeId is null, hours remain 0 (OFF day)

  return prisma.employeeShiftAssignment.update({
    where: { id },
    data: {
      ...data,
      hours,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      schedule: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      },
      RotatingShiftType: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
          duration: true,
        },
      },
    },
  });
};

const approveEmployeeShiftAssignment = async (
  id: string,
  companyId: string
) => {
  const assignment = await prisma.employeeShiftAssignment.findFirst({
    where: { id },
    include: {
      employee: { select: { companyId: true } },
    },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  if (assignment.employee.companyId !== companyId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  if (assignment.isApproved) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Assignment is already approved"
    );
  }

  return prisma.employeeShiftAssignment.update({
    where: { id },
    data: { isApproved: true },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      schedule: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
        },
      },
    },
  });
};

const deleteEmployeeShiftAssignment = async (id: string, companyId: string) => {
  const assignment = await prisma.employeeShiftAssignment.findFirst({
    where: { id },
    include: {
      employee: { select: { companyId: true } },
    },
  });

  if (!assignment) {
    throw new ApiError(httpStatus.NOT_FOUND, "Assignment not found");
  }

  if (assignment.employee.companyId !== companyId) {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  if (assignment.isApproved) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot delete approved assignment"
    );
  }

  await prisma.employeeShiftAssignment.delete({
    where: { id },
  });

  return { message: "Assignment deleted successfully" };
};

// ==================== BULK OPERATIONS ====================

const bulkCreateAssignments = async (data: {
  scheduleId: string;
  assignments: Array<{
    employeeId: string;
    date: string; // Format: "YYYY-MM-DD"
    shiftTypeId?: string; // null = OFF day, uuid = actual shift type
  }>;
  companyId: string;
}) => {
  const { scheduleId, assignments, companyId } = data;

  // Verify schedule exists and belongs to company
  const schedule = await prisma.shiftSchedule.findFirst({
    where: { id: scheduleId, companyId },
  });

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift schedule not found");
  }

  if (schedule.isApproved) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot modify approved schedule"
    );
  }

  // Validate all employees belong to company
  const employeeIds = [...new Set(assignments.map((a) => a.employeeId))];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds }, companyId },
    select: { id: true },
  });

  if (employees.length !== employeeIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some employees not found or don't belong to company"
    );
  }

  // Upsert each assignment
  const results = await Promise.all(
    assignments.map((assignment) =>
      prisma.employeeShiftAssignment.upsert({
        where: {
          employeeId_date: {
            employeeId: assignment.employeeId,
            date: new Date(assignment.date),
          },
        },
        update: {
          shiftTypeId: assignment.shiftTypeId,
          hours: assignment.shiftTypeId ? 12 : 0,
        },
        create: {
          employeeId: assignment.employeeId,
          scheduleId,
          date: new Date(assignment.date),
          shiftTypeId: assignment.shiftTypeId,
          hours: assignment.shiftTypeId ? 12 : 0,
          isApproved: false,
        },
      })
    )
  );
  return {
    message: `${results.length} assignments have been successfully created or updated.`,
    count: results.length,
  };

  // return {
  //   message: `${results.length} assignments upserted successfully`,
  //   count: results.length,
  // };
};

// const bulkCreateAssignments = async (data: {
//   scheduleId: string;
//   assignments: Array<{
//     employeeId: string;
//     date: string; // Format: "YYYY-MM-DD"
//     shiftTypeId?: string; // null = OFF day, uuid = actual shift type
//   }>;
//   companyId: string;
// }) => {
//   const { scheduleId, assignments, companyId } = data;

//   // Verify schedule exists and belongs to company
//   const schedule = await prisma.shiftSchedule.findFirst({
//     where: { id: scheduleId, companyId },
//   });

//   if (!schedule) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Shift schedule not found");
//   }

//   if (schedule.isApproved) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Cannot modify approved schedule"
//     );
//   }

//   // Validate all employees belong to company
//   const employeeIds = [...new Set(assignments.map((a) => a.employeeId))];
//   const employees = await prisma.employee.findMany({
//     where: { id: { in: employeeIds }, companyId },
//     select: { id: true },
//   });

//   if (employees.length !== employeeIds.length) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Some employees not found or don't belong to company"
//     );
//   }

//   // Check for existing assignments
//   const dates = assignments.map((a) => new Date(a.date));
//   const existingAssignments = await prisma.employeeShiftAssignment.findMany({
//     where: {
//       employeeId: { in: employeeIds },
//       date: { in: dates },
//     },
//   });

//   if (existingAssignments.length > 0) {
//     throw new ApiError(
//       httpStatus.CONFLICT,
//       "Some assignments already exist for the specified dates"
//     );
//   }

//   // Create all assignments
//   const createdAssignments = await prisma.employeeShiftAssignment.createMany({
//     data: assignments.map((assignment) => ({
//       employeeId: assignment.employeeId,
//       scheduleId,
//       date: new Date(assignment.date),
//       shiftTypeId: assignment.shiftTypeId,
//       hours: assignment.shiftTypeId ? 12 : 0, // Will be updated with actual duration later
//       isApproved: false,
//     })),
//   });

//   return {
//     message: `${createdAssignments.count} assignments created successfully`,
//     count: createdAssignments.count,
//   };
// };

const bulkUpdateAssignments = async (data: {
  scheduleId: string;
  assignments: Array<{
    employeeId: string;
    date: string; // Format: "YYYY-MM-DD"
    shiftTypeId?: string | null; // null = OFF day, uuid = actual shift type
  }>;
  companyId: string;
}) => {
  const { scheduleId, assignments, companyId } = data;

  console.log("=== Bulk Update Assignments ===");
  console.log("Schedule ID:", scheduleId);
  console.log("Company ID:", companyId);
  console.log("Assignments count:", assignments.length);

  // Verify schedule exists and belongs to company
  const schedule = await prisma.shiftSchedule.findFirst({
    where: { id: scheduleId, companyId },
  });

  if (!schedule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift schedule not found");
  }

  if (schedule.isApproved) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Cannot modify approved schedule"
    );
  }

  // Validate all employees belong to company
  const employeeIds = [...new Set(assignments.map((a) => a.employeeId))];
  const employees = await prisma.employee.findMany({
    where: { id: { in: employeeIds }, companyId },
    select: { id: true },
  });

  if (employees.length !== employeeIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some employees not found or don't belong to company"
    );
  }

  // Validate shift types belong to company (for non-null shiftTypeIds)
  const shiftTypeIds = assignments
    .map((a) => a.shiftTypeId)
    .filter((id): id is string => id !== null && id !== undefined);

  if (shiftTypeIds.length > 0) {
    const shiftTypes = await prisma.rotatingShiftType.findMany({
      where: { id: { in: shiftTypeIds }, companyId },
      select: { id: true },
    });

    if (shiftTypes.length !== [...new Set(shiftTypeIds)].length) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Some shift types not found or don't belong to company"
      );
    }
  }

  let updatedCount = 0;
  let createdCount = 0;
  const resultAssignments = [];

  // Process each assignment using upsert
  for (const assignment of assignments) {
    const assignmentDate = new Date(assignment.date);

    // Check if assignment already exists
    const existingAssignment = await prisma.employeeShiftAssignment.findUnique({
      where: {
        employeeId_date: {
          employeeId: assignment.employeeId,
          date: assignmentDate,
        },
      },
    });

    const upsertData = {
      employeeId: assignment.employeeId,
      scheduleId,
      date: assignmentDate,
      shiftTypeId: assignment.shiftTypeId,
      hours: assignment.shiftTypeId ? 12 : 0, // Default hours, can be adjusted later
      isApproved: false, // Reset approval status on update
    };

    // Upsert the assignment
    const result = await prisma.employeeShiftAssignment.upsert({
      where: {
        employeeId_date: {
          employeeId: assignment.employeeId,
          date: assignmentDate,
        },
      },
      update: {
        scheduleId,
        shiftTypeId: assignment.shiftTypeId,
        hours: assignment.shiftTypeId ? 12 : 0,
        isApproved: false, // Reset approval status on update
      },
      create: upsertData,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            deviceUserId: true,
          },
        },
        RotatingShiftType: {
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            duration: true,
          },
        },
        schedule: {
          select: {
            id: true,
            name: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (existingAssignment) {
      updatedCount++;
    } else {
      createdCount++;
    }

    resultAssignments.push(result);
  }

  console.log(`Updated: ${updatedCount}, Created: ${createdCount}`);

  return {
    scheduleId,
    totalAssignments: assignments.length,
    updatedAssignments: updatedCount,
    createdAssignments: createdCount,
    deletedAssignments: 0, // Not implemented in this version
    message: `Successfully processed ${assignments.length} assignments: ${createdCount} created, ${updatedCount} updated`,
    assignments: resultAssignments,
  };
};

const getEmployeeRotationSummary = async (
  employeeId: string,
  companyId: string,
  startDate: Date,
  endDate: Date
) => {
  // Verify employee belongs to company
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
  });

  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  const assignments = await prisma.employeeShiftAssignment.findMany({
    include: {
      RotatingShiftType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    where: {
      employeeId,
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: { date: "asc" },
  });

  // Calculate summary
  const summary = {
    totalDays: assignments.length,
    totalHours: assignments.reduce((sum, a) => sum + (a.hours || 0), 0),
    assignments: assignments.map((a) => ({
      date: a.date,
      shiftTypeId: a.shiftTypeId,
      shiftTypeName: a.RotatingShiftType?.name || "OFF", // <-- actual ROTATION TYPE name
      hours: a.hours,
      isApproved: a.isApproved,
    })),
  };

  return summary;
};

const getAllEmployeeRotationSummaries = async (
  companyId: string,
  startDate: Date,
  endDate: Date
) => {
  // Get all assignments for employees in the company within date range
  const assignments = await prisma.employeeShiftAssignment.findMany({
    include: {
      RotatingShiftType: {
        select: {
          id: true,
          name: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
    },
    where: {
      employee: {
        companyId,
      },
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
    orderBy: [{ employeeId: "asc" }, { date: "asc" }],
  });

  // Group by employeeId
  const grouped = assignments.reduce((acc, a) => {
    if (!acc[a.employeeId]) {
      acc[a.employeeId] = {
        employeeId: a.employeeId,
        employeeName: `${a.employee.name} ${a.employee.username}`,
        totalDays: 0,
        totalHours: 0,
        assignments: [],
      };
    }

    acc[a.employeeId].totalDays += 1;
    acc[a.employeeId].totalHours += a.hours || 0;
    acc[a.employeeId].assignments.push({
      date: a.date,
      shiftTypeId: a.shiftTypeId,
      shiftTypeName: a.RotatingShiftType?.name || "OFF",
      hours: a.hours,
      isApproved: a.isApproved,
    });

    return acc;
  }, {} as Record<string, any>);

  // Convert object to array
  return Object.values(grouped);
};

// const getEmployeeRotationSummary = async (
//   employeeId: string,
//   companyId: string,
//   startDate: Date,
//   endDate: Date
// ) => {
//   // Verify employee belongs to company
//   const employee = await prisma.employee.findFirst({
//     where: { id: employeeId, companyId },
//   });

//   if (!employee) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
//   }

//   const assignments = await prisma.employeeShiftAssignment.findMany({
//     include: {
//       RotatingShiftType: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//     },
//     where: {
//       employeeId,
//       date: {
//         gte: new Date(startDate),
//         lte: new Date(endDate),
//       },
//     },
//     orderBy: { date: "asc" },
//   });

//   // Calculate summary
//   const summary = {
//     totalDays: assignments.length,
//     // dayShifts: assignments.filter((a) => a.shiftTypeId && a.hours > 0).length,
//     // nightShifts: assignments.filter((a) => a.shiftTypeId && a.hours > 0).length, // Will need to check shift type name
//     // offDays: assignments.filter((a) => !a.shiftTypeId || a.hours === 0).length,
//     totalHours: assignments.reduce((sum, a) => sum + a.hours, 0),
//     assignments: assignments.map((a) => ({
//       date: a.date,
//       shiftTypeId: a.shiftTypeId,
//       shiftTypeName: a.shiftTypeId ? "SHIFT" : "OFF", // Will need to fetch actual names
//       hours: a.hours,
//       isApproved: a.isApproved,
//     })),
//   };

//   return summary;
// };

export default {
  // Shift Schedule methods
  createShiftSchedule,
  getShiftSchedules,
  getShiftScheduleById,
  updateShiftSchedule,
  approveShiftSchedule,
  deleteShiftSchedule,

  // Employee Shift Assignment methods
  createEmployeeShiftAssignment,
  getEmployeeShiftAssignments,
  updateEmployeeShiftAssignment,
  approveEmployeeShiftAssignment,
  deleteEmployeeShiftAssignment,

  // Bulk operations
  bulkCreateAssignments,
  bulkUpdateAssignments,
  getEmployeeRotationSummary,
  getAllEmployeeRotationSummaries,
};
