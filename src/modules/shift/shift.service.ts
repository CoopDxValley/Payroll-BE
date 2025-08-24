import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import { CreateShiftData, UpdateShiftData } from "./shift.types";

// Helper function to convert time string to DateTime
const convertTimeStringToDateTime = (
  timeString: string,
  baseDate: Date = new Date()
): Date => {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, seconds, 0);
  return date;
};

// Helper function to convert DateTime to time string
const convertDateTimeToTimeString = (dateTime: Date): string => {
  const hours = dateTime.getHours().toString().padStart(2, "0");
  const minutes = dateTime.getMinutes().toString().padStart(2, "0");
  const seconds = dateTime.getSeconds().toString().padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

// Helper function to format shift response with time strings
const formatShiftResponse = (shift: any) => {
  if (shift.patternDays) {
    shift.patternDays = shift.patternDays.map((day: any) => ({
      ...day,
      startTime: convertDateTimeToTimeString(day.startTime),
      endTime: convertDateTimeToTimeString(day.endTime),
    }));
  }
  return shift;
};

// Helper function to validate pattern days for FIXED_WEEKLY shifts
const validateFixedWeeklyPatternDays = (patternDays: any[]) => {
  if (!patternDays || patternDays.length !== 7) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "FIXED_WEEKLY shifts must have exactly 7 pattern days"
    );
  }

  // Check if all day numbers 1-7 are present
  const dayNumbers = patternDays.map((day) => day.dayNumber).sort();
  const expectedDays = [1, 2, 3, 4, 5, 6, 7];

  if (JSON.stringify(dayNumbers) !== JSON.stringify(expectedDays)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "FIXED_WEEKLY shifts must have pattern days covering all days 1-7 (Monday-Sunday)"
    );
  }

  // Check for duplicate day numbers
  const uniqueDayNumbers = new Set(dayNumbers);
  if (uniqueDayNumbers.size !== 7) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "FIXED_WEEKLY shifts cannot have duplicate day numbers"
    );
  }
};

const createShift = async (data: CreateShiftData) => {
  const { name, shiftType, companyId, patternDays } = data;

  if (!name || !shiftType || !companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  // For FIXED_WEEKLY shifts, validate pattern days
  if (shiftType === "FIXED_WEEKLY") {
    if (!patternDays || patternDays.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Pattern days are required for FIXED_WEEKLY shifts"
      );
    }

    // Validate exactly 7 pattern days covering all days 1-7
    validateFixedWeeklyPatternDays(patternDays);
  }

  const existing = await prisma.shift.findFirst({
    where: { name, companyId, isActive: true },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Shift already exists");
  }

  // const result = await prisma.shift.create({
  //   data: {
  //     name,
  //     shiftType,
  //     companyId,
  //     patternDays: shiftType === "FIXED_WEEKLY" ? {
  //       create: patternDays!.map(day => ({
  //         dayNumber: day.dayNumber,
  //         dayType: day.dayType,
  //         startTime: convertTimeStringToDateTime(day.startTime), // Convert to DateTime
  //         endTime: convertTimeStringToDateTime(day.endTime),     // Convert to DateTime
  //         breakTime: day.breakTime,
  //         gracePeriod: day.gracePeriod,
  //       }))
  //     } : undefined,
  //   },
  //   include: {
  //     patternDays: true,
  //   },
  // });

  // return formatShiftResponse(result);

  const result = await prisma.shift.create({
    data: {
      name,
      shiftType,
      companyId,
      patternDays:
        shiftType === "FIXED_WEEKLY"
          ? {
              create: patternDays!.map((day) => {
                if (day.dayType === "REST_DAY") {
                  return {
                    dayNumber: day.dayNumber,
                    dayType: day.dayType,
                    startTime: convertTimeStringToDateTime("00:00:00"),
                    endTime: convertTimeStringToDateTime("00:00:00"),
                    breakTime: 0,
                    gracePeriod: 0,
                  };
                }

                return {
                  dayNumber: day.dayNumber,
                  dayType: day.dayType,
                  startTime: convertTimeStringToDateTime(day.startTime),
                  endTime: convertTimeStringToDateTime(day.endTime),
                  breakTime: day.breakTime,
                  gracePeriod: day.gracePeriod,
                };
              }),
            }
          : undefined,
    },
    include: {
      patternDays: true,
    },
  });
};

const getAllShifts = async (companyId: string, type?: string) => {
  const whereClause: any = { companyId, isActive: true };

  if (type) {
    // Normalize input to valid enum values
    const validTypes = ["FIXED_WEEKLY", "ROTATING"];
    if (!validTypes.includes(type)) {
      throw new Error(`Invalid shift type. Allowed: ${validTypes.join(", ")}`);
    }
    whereClause.shiftType = type;
  }

  const shifts = await prisma.shift.findMany({
    where: whereClause,
    include: {
      patternDays: true,
      employeeShifts: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return shifts.map(formatShiftResponse);
};

// const getAllShifts = async (companyId: string, type?: string) => {
//   const whereClause: any = { companyId, isActive: true };

//   if (type) {
//     whereClause.shiftType = type; // filter only if provided
//   }

//   const shifts = await prisma.shift.findMany({
//     where: whereClause,
//     include: {
//       patternDays: true,
//       employeeShifts: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return shifts.map(formatShiftResponse);
// };

// const getAllShifts = async (companyId: string) => {
//   const shifts = await prisma.shift.findMany({
//     where: { companyId, isActive: true },
//     include: {
//       patternDays: true,
//       employeeShifts: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return shifts.map(formatShiftResponse);
// };

const getShiftById = async (id: string) => {
  const shift = await prisma.shift.findUnique({
    where: { id },
    include: {
      patternDays: true,
      employeeShifts: true,
      company: true,
    },
  });

  return shift ? formatShiftResponse(shift) : null;
};

const updateShift = async (id: string, data: UpdateShiftData) => {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // If updating pattern days for FIXED_WEEKLY shift, validate them
  if (data.patternDays && existing.shiftType === "FIXED_WEEKLY") {
    validateFixedWeeklyPatternDays(data.patternDays);
  }

  // If changing shift type to FIXED_WEEKLY, validate pattern days
  if (data.shiftType === "FIXED_WEEKLY" && data.patternDays) {
    validateFixedWeeklyPatternDays(data.patternDays);
  }

  // If updating pattern days, first delete existing ones and then create new ones
  if (data.patternDays && existing.shiftType === "FIXED_WEEKLY") {
    await prisma.shiftDay.deleteMany({
      where: { shiftId: id },
    });
  }

  const result = await prisma.shift.update({
    where: { id },
    data: {
      ...data,
      patternDays: data.patternDays
        ? {
            create: data.patternDays.map((day) => ({
              dayNumber: day.dayNumber,
              dayType: day.dayType,
              startTime: convertTimeStringToDateTime(day.startTime), // Convert to DateTime
              endTime: convertTimeStringToDateTime(day.endTime), // Convert to DateTime
              breakTime: day.breakTime,
              gracePeriod: day.gracePeriod,
            })),
          }
        : undefined,
    },
    include: {
      patternDays: true,
    },
  });

  return formatShiftResponse(result);
};

const deleteShift = async (id: string) => {
  const existing = await prisma.shift.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  const result = await prisma.shift.update({
    where: { id },
    data: { isActive: false },
  });

  return formatShiftResponse(result);
};

export default {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
};
