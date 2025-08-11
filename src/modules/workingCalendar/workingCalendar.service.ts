import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

const createWorkingCalendar = async (data: {
  year: number;
  date: Date;
  dayType: "WORKING_DAY" | "HOLIDAY";
  description?: string;
  isActive?: boolean;
  companyId: string;
}) => {
  const { year, date, dayType, description, isActive = true, companyId } = data;

  // ✅ Step 1: Required field validation
  if (!year || !date || !dayType) {
    throw new ApiError(httpStatus.BAD_REQUEST, "year, date, and dayType are required");
  }

  // ✅ Step 2: Validate year format
  if (year < 1900 || year > 2100) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Year must be between 1900 and 2100");
  }

  // ✅ Step 3: Validate dayType
  const validDayTypes = ["WORKING_DAY", "HOLIDAY"];
  if (!validDayTypes.includes(dayType)) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Invalid dayType. Must be one of: ${validDayTypes.join(", ")}`);
  }

  // ✅ Step 4: Check if entry already exists for this date and company
  const existingEntry = await prisma.workingCalendar.findFirst({
    where: {
      companyId,
      date: new Date(date),
    },
  });

  if (existingEntry) {
    throw new ApiError(httpStatus.CONFLICT, "Working calendar entry already exists for this date");
  }

  // ✅ Step 5: Create working calendar entry
  return prisma.workingCalendar.create({
    data: {
      companyId,
      year,
      date: new Date(date),
      dayType,
      description,
      isActive,
    },
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

const getAllWorkingCalendar = async (
  companyId: string,
  filters: {
    year?: number;
    dayType?: string;
    date?: string;
    isActive?: boolean;
  }
) => {
  const where: any = {
    companyId,
  };

  if (filters.year) {
    where.year = filters.year;
  }

  if (filters.dayType) {
    where.dayType = filters.dayType;
  }

  if (filters.date) {
    where.date = new Date(filters.date);
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  return prisma.workingCalendar.findMany({
    where,
    include: {
      company: {
        select: {
          id: true,
          // name: true,
        },
      },
    },
    orderBy: [
      { year: "desc" },
      { date: "asc" },
    ],
  });
};

const getWorkingCalendarById = async (id: string) => {
  return prisma.workingCalendar.findUnique({
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

const updateWorkingCalendar = async (
  id: string,
  data: Partial<{
    year: number;
    date: Date;
    dayType: "WORKING_DAY" | "HOLIDAY";
    description: string;
    isActive: boolean;
  }>
) => {
  const existing = await prisma.workingCalendar.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Working calendar entry not found");
  }

  // ✅ Validate dayType if provided
  if (data.dayType) {
    const validDayTypes = ["WORKING_DAY", "HOLIDAY"];
    if (!validDayTypes.includes(data.dayType)) {
      throw new ApiError(httpStatus.BAD_REQUEST, `Invalid dayType. Must be one of: ${validDayTypes.join(", ")}`);
    }
  }

  // ✅ Validate year if provided
  if (data.year && (data.year < 1900 || data.year > 2100)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Year must be between 1900 and 2100");
  }

  // ✅ Check for duplicate date if date is being updated
  if (data.date) {
    const duplicate = await prisma.workingCalendar.findFirst({
      where: {
        companyId: existing.companyId,
        date: new Date(data.date),
        id: { not: id },
      },
    });

    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "Working calendar entry already exists for this date");
    }
  }

  return prisma.workingCalendar.update({
    where: { id },
    data: {
      ...data,
      ...(data.date && { date: new Date(data.date) }),
    },
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

const deleteWorkingCalendar = async (id: string) => {
  const existing = await prisma.workingCalendar.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Working calendar entry not found");
  }

  return prisma.workingCalendar.delete({
    where: { id },
  });
};

const bulkUploadWorkingCalendar = async (
  entries: Array<{
    year: number;
    date: string;
    dayType: "WORKING_DAY" | "HOLIDAY";
    description?: string;
    isActive?: boolean;
  }>,
  companyId: string
) => {
  const result = {
    successCount: 0,
    errorCount: 0,
    errors: [] as Array<{ index: number; error: string; data: any }>,
    createdEntries: [] as any[],
  };

  // ✅ Process entries in batches to avoid overwhelming the database
  const batchSize = 100;
  const batches = [];
  
  for (let i = 0; i < entries.length; i += batchSize) {
    batches.push(entries.slice(i, i + batchSize));
  }

  for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
    const batch = batches[batchIndex];
    
    for (let entryIndex = 0; entryIndex < batch.length; entryIndex++) {
      const entry = batch[entryIndex];
      const globalIndex = batchIndex * batchSize + entryIndex;

      try {
        // ✅ Validate entry
        if (!entry.year || !entry.date || !entry.dayType) {
          result.errors.push({
            index: globalIndex,
            error: "Missing required fields: year, date, or dayType",
            data: entry,
          });
          result.errorCount++;
          continue;
        }

        // ✅ Validate year
        if (entry.year < 1900 || entry.year > 2100) {
          result.errors.push({
            index: globalIndex,
            error: "Year must be between 1900 and 2100",
            data: entry,
          });
          result.errorCount++;
          continue;
        }

        // ✅ Validate dayType
        const validDayTypes = ["WORKING_DAY", "HOLIDAY"];
        if (!validDayTypes.includes(entry.dayType)) {
          result.errors.push({
            index: globalIndex,
            error: `Invalid dayType. Must be one of: ${validDayTypes.join(", ")}`,
            data: entry,
          });
          result.errorCount++;
          continue;
        }

        // ✅ Validate date format
        const date = new Date(entry.date);
        if (isNaN(date.getTime())) {
          result.errors.push({
            index: globalIndex,
            error: "Invalid date format",
            data: entry,
          });
          result.errorCount++;
          continue;
        }

        // ✅ Check for existing entry
        const existingEntry = await prisma.workingCalendar.findFirst({
          where: {
            companyId,
            date,
          },
        });

        if (existingEntry) {
          result.errors.push({
            index: globalIndex,
            error: "Working calendar entry already exists for this date",
            data: entry,
          });
          result.errorCount++;
          continue;
        }

        // ✅ Create entry
        const createdEntry = await prisma.workingCalendar.create({
          data: {
            companyId,
            year: entry.year,
            date,
            dayType: entry.dayType,
            description: entry.description,
            isActive: entry.isActive !== undefined ? entry.isActive : true,
          },
          include: {
            company: {
              select: {
                id: true,
                // name: true,
              },
            },
          },
        });

        result.createdEntries.push(createdEntry);
        result.successCount++;

      } catch (error) {
        result.errors.push({
          index: globalIndex,
          error: error instanceof Error ? error.message : "Unknown error",
          data: entry,
        });
        result.errorCount++;
      }
    }
  }

  return result;
};

const getWorkingCalendarByYear = async (year: number, companyId: string) => {
  return prisma.workingCalendar.findMany({
    where: {
      companyId,
      year,
    },
    include: {
      company: {
        select: {
          id: true,
          // name: true,
        },
      },
    },
    orderBy: { date: "asc" },
  });
};
const getWorkingCalendarByDateRange = async (
  startDate: Date,
  endDate: Date,
  companyId: string
) => {
  return prisma.workingCalendar.findMany({
    where: {
      companyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      company: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });
};

// const getWorkingCalendarByDateRange = async (
//   startDate: Date,
//   endDate: Date,
//   companyId: string
// ) => {
//   return prisma.workingCalendar.findMany({
//     where: {
//       companyId,
//       date: {
//         gte: startDate,
//         lte: endDate,
//       },
//     },
//     include: {
//       company: {
//         select: {
//           id: true,
//           // name: true,
//         },
//       },
//     },
//     orderBy: { date: "asc" },
//   });
// };

const toggleWorkingCalendarStatus = async (id: string) => {
  const existing = await prisma.workingCalendar.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Working calendar entry not found");
  }

  return prisma.workingCalendar.update({
    where: { id },
    data: {
      isActive: !existing.isActive,
    },
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

export default {
  createWorkingCalendar,
  getAllWorkingCalendar,
  getWorkingCalendarById,
  updateWorkingCalendar,
  deleteWorkingCalendar,
  bulkUploadWorkingCalendar,
  getWorkingCalendarByYear,
  getWorkingCalendarByDateRange,
  toggleWorkingCalendarStatus,
}; 