import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

interface CreateOvertimeGracePeriodData {
  companyId: string;
  gracePeriodMinutes?: number;
  isActive?: boolean;
}

interface UpdateOvertimeGracePeriodData {
  gracePeriodMinutes?: number;
  isActive?: boolean;
}
const createOvertimeGracePeriod = async (
  data: CreateOvertimeGracePeriodData
) => {
  const { companyId, gracePeriodMinutes = 10, isActive = true } = data;

  // 1️⃣ Check if company exists
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  // 2️⃣ Deactivate any existing active records for this company
  if (isActive) {
    await prisma.overtimeGracePeriod.updateMany({
      where: { companyId, isActive: true },
      data: { isActive: false },
    });
  }

  // 3️⃣ Create new record (can now safely insert without unique constraint issue)
  return await prisma.overtimeGracePeriod.create({
    data: {
      companyId,
      gracePeriodMinutes,
      isActive,
    },
    include: {
      company: {
        select: { id: true },
      },
    },
  });
};

// const createOvertimeGracePeriod = async (
//   data: CreateOvertimeGracePeriodData
// ) => {
//   const { companyId, gracePeriodMinutes = 10, isActive = true } = data;

//   // Check if company exists
//   const company = await prisma.company.findUnique({
//     where: { id: companyId },
//   });

//   if (!company) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
//   }

//   // Check if overtime grace period already exists for this company
//   const existingOvertimeGracePeriod =
//     await prisma.overtimeGracePeriod.findUnique({
//       where: { companyId },
//     });

//   if (existingOvertimeGracePeriod) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Overtime grace period already exists for this company"
//     );
//   }

//   return await prisma.overtimeGracePeriod.create({
//     data: {
//       companyId,
//       gracePeriodMinutes,
//       isActive,
//     },
//     include: {
//       company: {
//         select: {
//           id: true,
//           // name: true,
//         },
//       },
//     },
//   });
// };

const getAllOvertimeGracePeriods = async () => {
  return await prisma.overtimeGracePeriod.findMany({
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
          // name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
const getAllActiveOvertimeGracePeriods = async () => {
  return await prisma.overtimeGracePeriod.findMany({
    where: { isActive: true },
    include: {
      company: {
        select: {
          id: true,
          companyCode: true,
          // name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
const getOvertimeGracePeriodById = async (id: string) => {
  return await prisma.overtimeGracePeriod.findUnique({
    where: { id },
    include: {
      company: {
        select: {
          id: true,
          // name: true,
        },
      },
    },
  });
};

const updateOvertimeGracePeriod = async (
  id: string,
  data: UpdateOvertimeGracePeriodData & { companyId: string }
) => {
  const existingRecord = await prisma.overtimeGracePeriod.findUnique({
    where: { id },
  });

  if (!existingRecord) {
    throw new ApiError(httpStatus.NOT_FOUND, "Overtime grace period not found");
  }

  // Step 1: Deactivate all other records for this company
  await prisma.overtimeGracePeriod.updateMany({
    where: { companyId: data.companyId },
    data: { isActive: false },
  });

  // Step 2: Create a new active record
  return await prisma.overtimeGracePeriod.create({
    data: {
      companyId: data.companyId,
      gracePeriodMinutes:
        data.gracePeriodMinutes ?? existingRecord.gracePeriodMinutes,
      isActive: true,
    },
    include: {
      company: {
        select: { id: true },
      },
    },
  });
};

const deleteOvertimeGracePeriod = async (id: string) => {
  const overtimeGracePeriod = await prisma.overtimeGracePeriod.findUnique({
    where: { id },
  });

  if (!overtimeGracePeriod) {
    throw new ApiError(httpStatus.NOT_FOUND, "Overtime grace period not found");
  }

  return await prisma.overtimeGracePeriod.delete({
    where: { id },
  });
};

export default {
  createOvertimeGracePeriod,
  getAllOvertimeGracePeriods,
  getOvertimeGracePeriodById,
  updateOvertimeGracePeriod,
  deleteOvertimeGracePeriod,
  getAllActiveOvertimeGracePeriods,
};