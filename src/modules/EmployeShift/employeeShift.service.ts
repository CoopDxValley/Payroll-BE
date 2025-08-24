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
  if (!employeeId || !shiftId) {
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

// Get all employees assigned to a specific shift
const getEmployeesByShiftId = async (
  shiftId: string,
  companyId?: string,
  scheduleId?: string | null // <-- new optional param
) => {
  console.log("=== Getting Employees by Shift ID ===");
  console.log("Shift ID:", shiftId);
  console.log("Company ID:", companyId);
  console.log("Schedule ID:", scheduleId);

  // First, get the shift to check its type
  const shift = await prisma.shift.findUnique({
    where: { id: shiftId },
    select: {
      id: true,
      name: true,
      shiftType: true,
      companyId: true,
    },
  });

  if (!shift) {
    throw new Error(`Shift with ID ${shiftId} not found`);
  }

  console.log(`Shift type: ${shift.shiftType}`);

  // Handle ROTATION shifts differently
  if (shift.shiftType === "ROTATING") {
    return await getEmployeesForRotatingShift(shiftId, companyId, scheduleId);
  }

  // Handle FIXED_WEEKLY shifts (existing logic)
  return await getEmployeesForFixedWeeklyShift(shiftId, companyId, scheduleId);
};

// Helper function for ROTATION shifts - fetch from EmployeeShiftAssignment
const getEmployeesForRotatingShift = async (
  shiftId: string,
  companyId?: string,
  scheduleId?: string | null
) => {
  console.log(
    "=== Fetching ROTATION shift employees from EmployeeShiftAssignment ==="
  );

  const where: any = {
    // isApproved: true, // Only approved assignments
  };

  // Add company filter if provided
  if (companyId) {
    where.employee = {
      companyId,
    };

    // Note: Not filtering by RotatingShiftType.companyId because:
    // 1. OFF days might have null shiftTypeId (no RotatingShiftType)
    // 2. We want to include all assignments for employees in this company
  }

  // For rotation shifts, handle schedule filtering
  if (scheduleId) {
    // If scheduleId is provided, filter by that specific schedule
    console.log(`Filtering by scheduleId: ${scheduleId}`);
    where.scheduleId = scheduleId;
  } else {
    // If no scheduleId provided, get all assignments regardless of schedule
    // This will include assignments with scheduleId and without scheduleId
    console.log(
      "No scheduleId provided - fetching all rotation assignments for company"
    );

    // We don't add any scheduleId filter here, so it will get all assignments
    // The company filter (added above) will ensure we only get assignments for the right company
  }

  console.log("Query where clause:", JSON.stringify(where, null, 2));

  const assignments = await prisma.employeeShiftAssignment.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
          deviceUserId: true,
          employeeIdNumber: true,
          gender: true,
          // Include current position and grade
          positionHistory: {
            where: { toDate: null },
            select: {
              position: {
                select: {
                  id: true,
                  positionName: true,
                },
              },
            },
          },
          gradeHistory: {
            where: { toDate: null },
            select: {
              grade: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
      RotatingShiftType: {
        select: {
          id: true,
          name: true,
          startTime: true,
          endTime: true,
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
    orderBy: [
      { date: "desc" }, // Most recent assignments first
      { employee: { name: "asc" } }, // Then by employee name
    ],
  });

  console.log(`Found ${assignments.length} rotation assignments`);

  // Also let's check if there are any assignments at all for this company
  const totalAssignments = await prisma.employeeShiftAssignment.count({
    where: {
      employee: {
        companyId: companyId,
      },
    },
  });
  console.log(`Total assignments in company: ${totalAssignments}`);

  // Let's also check for assignments with the specific scheduleId if provided
  if (scheduleId) {
    const scheduleAssignments = await prisma.employeeShiftAssignment.count({
      where: {
        scheduleId: scheduleId,
        employee: {
          companyId: companyId,
        },
      },
    });
    console.log(
      `Assignments with scheduleId ${scheduleId}: ${scheduleAssignments}`
    );
  }

  // Check if there are assignments without the RotatingShiftType filter
  const assignmentsWithoutShiftTypeFilter =
    await prisma.employeeShiftAssignment.count({
      where: {
        employee: {
          companyId: companyId,
        },
        scheduleId: scheduleId || undefined,
        isApproved: true,
      },
    });
  console.log(
    `Assignments without RotatingShiftType filter: ${assignmentsWithoutShiftTypeFilter}`
  );

  // Group assignments by employee to get unique employees with their assignments
  const employeeAssignments = new Map();

  assignments.forEach((assignment) => {
    const employeeId = assignment.employee.id;

    if (!employeeAssignments.has(employeeId)) {
      employeeAssignments.set(employeeId, {
        employee: assignment.employee,
        assignments: [],
        totalDays: 0,
        activeDays: 0,
        offDays: 0,
      });
    }

    const emp = employeeAssignments.get(employeeId);
    emp.assignments.push({
      id: assignment.id,
      date: assignment.date,
      hours: assignment.hours,
      shiftType: assignment.RotatingShiftType,
      isApproved: assignment.isApproved,
      schedule: assignment.schedule,
    });

    emp.totalDays++;
    if (assignment.hours > 0) {
      emp.activeDays++;
    } else {
      emp.offDays++;
    }
  });

  // Transform to final response format
  const employees = Array.from(employeeAssignments.values()).map((emp) => {
    // Only show assignments if scheduleId is provided and matches
    // If no scheduleId provided, show empty assignments
    const filteredAssignments = scheduleId
      ? emp.assignments.filter(
          (assignment: any) => assignment.schedule?.id === scheduleId
        )
      : []; // Empty array when no scheduleId provided

    return {
      id: emp.employee.id,
      name: emp.employee.name,
      username: emp.employee.username,
      phoneNumber: emp.employee.phoneNumber,
      deviceUserId: emp.employee.deviceUserId,
      employeeIdNumber: emp.employee.employeeIdNumber,
      gender: emp.employee.gender,
      currentPosition: emp.employee.positionHistory[0]?.position || null,
      currentGrade: emp.employee.gradeHistory[0]?.grade || null,
      // ROTATION-specific data
      rotationData: {
        totalDays: emp.totalDays,
        activeDays: emp.activeDays,
        offDays: emp.offDays,
        recentAssignments: filteredAssignments.slice(0, 7), // Last 7 days from filtered assignments
        // allAssignments: emp.assignments,
      },
    };
  });

  // Always check for additional employees in EmployeeShift table who might not be in the schedule
  console.log("Checking for additional employees in EmployeeShift table...");

  const employeeShifts = await prisma.employeeShift.findMany({
    where: {
      shiftId,
      isActive: true,
      employee: companyId ? { companyId } : undefined,
    },
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
          deviceUserId: true,
          employeeIdNumber: true,
          gender: true,
          positionHistory: {
            where: { toDate: null },
            select: {
              position: {
                select: {
                  id: true,
                  positionName: true,
                },
              },
            },
          },
          gradeHistory: {
            where: { toDate: null },
            select: {
              grade: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  console.log(
    `Found ${employeeShifts.length} employees in EmployeeShift table`
  );

  // Get employee IDs who already have rotation assignments in the schedule
  const employeesWithAssignments = new Set(employees.map((emp) => emp.id));

  // Add employees from EmployeeShift who don't already have assignments in the schedule
  const additionalEmployees = employeeShifts
    .filter((es) => !employeesWithAssignments.has(es.employee.id))
    .map((es) => ({
      id: es.employee.id,
      name: es.employee.name,
      username: es.employee.username,
      phoneNumber: es.employee.phoneNumber,
      deviceUserId: es.employee.deviceUserId,
      employeeIdNumber: es.employee.employeeIdNumber,
      gender: es.employee.gender,
      currentPosition: es.employee.positionHistory[0]?.position || null,
      currentGrade: es.employee.gradeHistory[0]?.grade || null,
      // Add a note that this employee is assigned to shift but not in this schedule
      rotationData: {
        totalDays: 0,
        activeDays: 0,
        offDays: 0,
        recentAssignments: [],
        allAssignments: [],
        note: scheduleId
          ? `Employee is assigned to rotation shift but not included in schedule ${scheduleId}`
          : "Employee is assigned to rotation shift but has no schedule assignments",
      },
      // Add the shift assignment details from EmployeeShift
      shiftAssignment: {
        startDate: es.startDate,
        endDate: es.endDate,
        isActive: es.isActive,
        assignmentType: "ROTATION_SHIFT_ASSIGNMENT",
        note: scheduleId
          ? "Employee assigned to rotation shift but not in this specific schedule"
          : "Employee assigned to rotation shift with no schedule assignments",
      },
    }));

  console.log(
    `Found ${additionalEmployees.length} additional employees not in the schedule`
  );

  // Combine employees with schedule assignments and those without
  const allEmployees = [...employees, ...additionalEmployees];

  // Sort by name for consistent ordering
  allEmployees.sort((a, b) => a.name.localeCompare(b.name));

  return {
    shiftId,
    shiftType: "ROTATING",
    scheduleId: scheduleId || null,
    totalEmployees: allEmployees.length,
    totalAssignments: assignments.length,
    employeesWithScheduleAssignments: employees.length,
    employeesWithoutScheduleAssignments: additionalEmployees.length,
    employees: allEmployees,
  };
};

// Helper function for FIXED_WEEKLY shifts (existing logic)
const getEmployeesForFixedWeeklyShift = async (
  shiftId: string,
  companyId?: string,
  scheduleId?: string | null
) => {
  console.log(
    "=== Fetching FIXED_WEEKLY shift employees from EmployeeShift ==="
  );

  // Note: EmployeeShift model doesn't have scheduleId field
  // For FIXED_WEEKLY shifts, scheduleId parameter will be ignored
  if (scheduleId) {
    console.log(
      `Warning: scheduleId ${scheduleId} provided for FIXED_WEEKLY shift, but this field doesn't exist in EmployeeShift model. Ignoring scheduleId.`
    );
  }

  const where: any = {
    shiftId,
    isActive: true, // Only get active assignments
    shift: {
      isActive: true, // Only get employees assigned to active shifts
    },
  };

  // Add company filter if provided
  if (companyId) {
    where.employee = {
      companyId,
    };
    where.shift.companyId = companyId;
  }

  // Note: scheduleId is NOT added here because EmployeeShift model doesn't have this field

  const employeeShifts = await prisma.employeeShift.findMany({
    where,
    include: {
      employee: {
        select: {
          id: true,
          name: true,
          username: true,
          phoneNumber: true,
          deviceUserId: true,
          employeeIdNumber: true,
          gender: true,
          // Include current position and grade
          positionHistory: {
            where: { toDate: null },
            select: {
              position: {
                select: {
                  id: true,
                  positionName: true,
                },
              },
            },
          },
          gradeHistory: {
            where: { toDate: null },
            select: {
              grade: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
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
    orderBy: [
      { employee: { name: "asc" } }, // Sort by employee name
      { startDate: "desc" }, // Then by most recent assignment
    ],
  });

  console.log(
    `Found ${
      employeeShifts.length
    } employees assigned to FIXED_WEEKLY shift ${shiftId} ${
      scheduleId ? `with scheduleId ${scheduleId}` : ""
    }`
  );

  // Transform the response to focus on employees
  const employees = employeeShifts.map((es) => ({
    id: es.employee.id,
    name: es.employee.name,
    username: es.employee.username,
    phoneNumber: es.employee.phoneNumber,
    deviceUserId: es.employee.deviceUserId,
    employeeIdNumber: es.employee.employeeIdNumber,
    gender: es.employee.gender,
    currentPosition: es.employee.positionHistory[0]?.position || null,
    currentGrade: es.employee.gradeHistory[0]?.grade || null,
    // FIXED_WEEKLY-specific data
    shiftAssignment: {
      startDate: es.startDate,
      endDate: es.endDate,
      isActive: es.isActive,
      shift: es.shift,
    },
  }));

  return {
    shiftId,
    shiftType: "FIXED_WEEKLY",
    scheduleId: scheduleId || null,
    totalEmployees: employees.length,
    employees,
  };
};

// // Get all employees assigned to a specific shift
// const getEmployeesByShiftId = async (shiftId: string, companyId?: string) => {
//   console.log("=== Getting Employees by Shift ID ===");
//   console.log("Shift ID:", shiftId);
//   console.log("Company ID:", companyId);

//   const where: any = {
//     shiftId,
//     isActive: true, // Only get active assignments
//     shift: {
//       isActive: true, // Only get employees assigned to active shifts
//     },
//   };

//   // Add company filter if provided
//   if (companyId) {
//     where.employee = {
//       companyId,
//     };
//     where.shift.companyId = companyId;
//   }

//   const employeeShifts = await prisma.employeeShift.findMany({
//     where,
//     include: {
//       employee: {
//         select: {
//           id: true,
//           name: true,
//           username: true,
//           phoneNumber: true,
//           deviceUserId: true,
//           employeeIdNumber: true,
//           gender: true,
//           // Include current position and grade
//           positionHistory: {
//             where: { toDate: null },
//             select: {
//               position: {
//                 select: {
//                   id: true,
//                   positionName: true,
//                 },
//               },
//             },
//           },
//           gradeHistory: {
//             where: { toDate: null },
//             select: {
//               grade: {
//                 select: {
//                   id: true,
//                   name: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//       shift: {
//         select: {
//           id: true,
//           name: true,
//           shiftType: true,
//           patternDays: true,
//         },
//       },
//     },
//     orderBy: [
//       { employee: { name: "asc" } }, // Sort by employee name
//       { startDate: "desc" }, // Then by most recent assignment
//     ],
//   });

//   console.log(
//     `Found ${employeeShifts.length} employees assigned to shift ${shiftId}`
//   );

//   // Transform the response to focus on employees
//   const employees = employeeShifts.map((es) => ({
//     // employeeShiftId: es.id,
//     // assignmentStartDate: es.startDate,
//     // assignmentEndDate: es.endDate,
//     // employee: {
//     id: es.employee.id,
//     name: es.employee.name,
//     username: es.employee.username,
//     phoneNumber: es.employee.phoneNumber,
//     deviceUserId: es.employee.deviceUserId,
//     employeeIdNumber: es.employee.employeeIdNumber,
//     gender: es.employee.gender,
//     currentPosition: es.employee.positionHistory[0]?.position || null,
//     currentGrade: es.employee.gradeHistory[0]?.grade || null,
//     // },
//     // shift: es.shift,
//   }));

//   return {
//     shiftId,
//     totalEmployees: employees.length,
//     employees,
//   };
// };

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
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No active shift found for employee"
    );
  }

  const { shift } = employeeShift;

  if (shift.shiftType === "FIXED_WEEKLY" && shift.patternDays) {
    // Calculate working hours based on pattern days
    const workingDays = shift.patternDays.filter(
      (day) => day.dayType !== "REST_DAY"
    );
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
        return total + hours / 2;
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
      companyId,
    },
    select: { id: true, name: true },
  });

  if (employees.length !== employeeIds.length) {
    const foundIds = employees.map((emp) => emp.id);
    const missingIds = employeeIds.filter((id) => !foundIds.includes(id));
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `Some employees not found: ${missingIds.join(", ")}`
    );
  }

  // Check for existing active assignments
  const existingAssignments = await prisma.employeeShift.findMany({
    where: {
      employeeId: { in: employeeIds },
      isActive: true,
    },
    select: { employeeId: true, employee: { select: { name: true } } },
  });

  if (existingAssignments.length > 0) {
    const employeeNames = existingAssignments
      .map((assignment) => assignment.employee.name)
      .join(", ");
    throw new ApiError(
      httpStatus.CONFLICT,
      `Some employees already have active shift assignments: ${employeeNames}`
    );
  }

  // Set startDate to today if not provided, don't set endDate
  const assignmentStartDate = startDate || new Date();

  // Bulk create assignments
  const assignments = await prisma.employeeShift.createMany({
    data: employeeIds.map((employeeId) => ({
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
    employees: employees.map((emp) => ({ id: emp.id, name: emp.name })),
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
      employee: { select: { id: true, name: true } },
    },
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
    unassignedEmployees: existingAssignments.map((assignment) => ({
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
  getEmployeesByShiftId,
  getActiveEmployeeShift,
  getEmployeeShiftHistory,
  getShiftDetails,
  calculateWorkingHours,
  bulkAssignShiftToEmployees,
  bulkUnassignShiftFromEmployees,
};
