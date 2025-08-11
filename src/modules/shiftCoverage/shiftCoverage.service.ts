import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

const requestCoverage = async (data: {
  originalEmployeeId: string;
  coveringEmployeeId: string;
  shiftId: string;
  coverageDate: Date;
  startTime: Date;
  endTime: Date;
  reason: "SICK_LEAVE" | "VACATION" | "EMERGENCY" | "SHIFT_SWAP" | "OVERTIME";
  requestedBy: string;
  companyId: string;
}) => {
  const {
    originalEmployeeId,
    coveringEmployeeId,
    shiftId,
    coverageDate,
    startTime,
    endTime,
    reason,
    requestedBy,
    companyId,
  } = data;

  // ✅ Step 1: Required field validation
  if (!originalEmployeeId || !coveringEmployeeId || !shiftId || !coverageDate || !startTime || !endTime || !reason) {
    throw new ApiError(httpStatus.BAD_REQUEST, "All required fields must be provided");
  }

  // ✅ Step 2: Verify original employee exists and belongs to company
  const originalEmployee = await prisma.employee.findFirst({
    where: { id: originalEmployeeId, companyId },
  });

  if (!originalEmployee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Original employee not found");
  }

  // ✅ Step 3: Verify covering employee exists and belongs to company
  const coveringEmployee = await prisma.employee.findFirst({
    where: { id: coveringEmployeeId, companyId },
  });

  if (!coveringEmployee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Covering employee not found");
  }

  // ✅ Step 4: Verify shift exists and belongs to company
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId, isActive: true },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // ✅ Step 5: Verify requester exists and belongs to company
  const requester = await prisma.employee.findFirst({
    where: { id: requestedBy, companyId },
  });

  if (!requester) {
    throw new ApiError(httpStatus.NOT_FOUND, "Requester not found");
  }

  // ✅ Step 6: Check if coverage already exists for this date and shift
  const existingCoverage = await prisma.shiftCoverage.findFirst({
    where: {
      originalEmployeeId,
      shiftId,
      coverageDate: new Date(coverageDate),
    },
  });

  if (existingCoverage) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Coverage request already exists for this employee, shift, and date"
    );
  }

  // ✅ Step 7: Validate that original employee has an active shift assignment
  const activeShift = await prisma.employeeShift.findFirst({
    where: {
      employeeId: originalEmployeeId,
      shiftId,
      isActive: true,
    },
  });

  if (!activeShift) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Original employee does not have an active assignment for this shift"
    );
  }

  // ✅ Step 8: Create coverage request
  return prisma.shiftCoverage.create({
    data: {
      originalEmployeeId,
      coveringEmployeeId,
      shiftId,
      coverageDate: new Date(coverageDate),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      reason,
      status: "PENDING",
      requestedBy,
    },
    include: {
      originalEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      coveringEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
};

const updateCoverageStatus = async (
  id: string,
  status: "APPROVED" | "REJECTED" | "COMPLETED",
  reason: string,
  approverId: string,
  companyId: string
) => {
  // ✅ Step 1: Verify coverage request exists and belongs to company
  const coverage = await prisma.shiftCoverage.findFirst({
    where: {
      id,
      originalEmployee: { companyId },
    },
    include: {
      originalEmployee: true,
      coveringEmployee: true,
      shift: true,
    },
  });

  if (!coverage) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coverage request not found");
  }

  // ✅ Step 2: Verify approver exists and belongs to company
  const approver = await prisma.employee.findFirst({
    where: { id: approverId, companyId },
  });

  if (!approver) {
    throw new ApiError(httpStatus.NOT_FOUND, "Approver not found");
  }

  // ✅ Step 3: Check if request is already processed
  if (coverage.status !== "PENDING") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Coverage request is already ${coverage.status.toLowerCase()}`
    );
  }

  // ✅ Step 4: Update status
  return prisma.shiftCoverage.update({
    where: { id },
    data: {
      status,
      approvedBy: approverId,
      updatedAt: new Date(),
    },
    include: {
      originalEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      coveringEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
  });
};

const getAllCoverageRequests = async (
  companyId: string,
  filters: {
    status?: string;
    employeeId?: string;
    coverageDate?: string;
    reason?: string;
  }
) => {
  const where: any = {
    originalEmployee: { companyId },
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.employeeId) {
    where.OR = [
      { originalEmployeeId: filters.employeeId },
      { coveringEmployeeId: filters.employeeId },
    ];
  }

  if (filters.coverageDate) {
    where.coverageDate = new Date(filters.coverageDate);
  }

  if (filters.reason) {
    where.reason = filters.reason;
  }

  return prisma.shiftCoverage.findMany({
    where,
    include: {
      originalEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      coveringEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
      { coverageDate: "asc" },
    ],
  });
};

const getCoverageRequestById = async (id: string) => {
  return prisma.shiftCoverage.findUnique({
    where: { id },
    include: {
      originalEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
          company: true,
        },
      },
      coveringEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
          company: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
          company: true,
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          username: true,
          company: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
          username: true,
          company: true,
        },
      },
    },
  });
};

const getEmployeeCoverageRequests = async (
  employeeId: string,
  companyId: string,
  status?: string
) => {
  const where: any = {
    OR: [
      { originalEmployeeId: employeeId },
      { coveringEmployeeId: employeeId },
    ],
    originalEmployee: { companyId },
  };

  if (status) {
    where.status = status;
  }

  return prisma.shiftCoverage.findMany({
    where,
    include: {
      originalEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      coveringEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: [
      { createdAt: "desc" },
      { coverageDate: "asc" },
    ],
  });
};
const getCoverageRequests = async ({
  companyId,
  status,
}: {
  companyId: string;
  status?: string;
}) => {
  const where: any = {
    originalEmployee: {
      companyId,
    },
  };

  if (status) {
    where.status = status.toUpperCase(); // Ensure enum format (APPROVED, PENDING, etc.)
  }

  return prisma.shiftCoverage.findMany({
    where,
    include: {
      originalEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      coveringEmployee: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      shift: {
        select: {
          id: true,
          name: true,
        },
      },
      requester: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
    },
    orderBy: [
      { createdAt: "asc" },
      { coverageDate: "asc" },
    ],
  });
};

// const getPendingCoverageRequests = async (companyId: string) => {
//   return prisma.shiftCoverage.findMany({
//     where: {
//       status: "PENDING",
//       originalEmployee: { companyId },
//     },
//     include: {
//       originalEmployee: {
//         select: {
//           id: true,
//           name: true,
//           username: true,
//         },
//       },
//       coveringEmployee: {
//         select: {
//           id: true,
//           name: true,
//           username: true,
//         },
//       },
//       shift: {
//         select: {
//           id: true,
//           name: true,
//         },
//       },
//       requester: {
//         select: {
//           id: true,
//           name: true,
//           username: true,
//         },
//       },
//     },
//     orderBy: [
//       { createdAt: "asc" },
//       { coverageDate: "asc" },
//     ],
//   });
// };

const cancelCoverageRequest = async (
  id: string,
  userId: string,
  companyId: string
) => {
  // ✅ Step 1: Verify coverage request exists and belongs to company
  const coverage = await prisma.shiftCoverage.findFirst({
    where: {
      id,
      originalEmployee: { companyId },
    },
  });

  if (!coverage) {
    throw new ApiError(httpStatus.NOT_FOUND, "Coverage request not found");
  }

  // ✅ Step 2: Check if request can be cancelled (only PENDING requests)
  if (coverage.status !== "PENDING") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel ${coverage.status.toLowerCase()} request`
    );
  }

  // ✅ Step 3: Check if user is authorized to cancel (requester or manager)
  if (coverage.requestedBy !== userId) {
    // TODO: Add manager role check here
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Only the requester or a manager can cancel this request"
    );
  }

  // ✅ Step 4: Delete the coverage request
  return prisma.shiftCoverage.delete({
    where: { id },
  });
};

export default {
  requestCoverage,
  updateCoverageStatus,
  getAllCoverageRequests,
  getCoverageRequestById,
  getEmployeeCoverageRequests,
  // getPendingCoverageRequests,
  getCoverageRequests,
  cancelCoverageRequest,
}; 