import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

// const createShiftDay = async (data: {
//   shiftId: string;
//   dayNumber: number;
//   dayType: "FULL_DAY" | "HALF_DAY" | "REST_DAY" | "NIGHT";
//   startTime: string;
//   endTime: string;
//   breakTime: number;
//   gracePeriod: number;
//   companyId: string;
// }) => {
//   const {
//     shiftId,
//     dayNumber,
//     dayType,
//     startTime,
//     endTime,
//     breakTime,
//     gracePeriod,
//     companyId,
//   } = data;
//   console.log(data);
//   console.log("kfjfdkjfkd");
//   console.log(shiftId);
//   const requiredFields = {
//     shiftId,
//     dayNumber,
//     dayType,
//     startTime,
//     endTime,
//     breakTime,
//     gracePeriod,
//   };
//   for (const [fieldName, value] of Object.entries(requiredFields)) {
//     if (value === undefined || value === null || value === "") {
//       throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} is required`);
//     }
//   }
//   // if (
//   //   !shiftId ||
//   //   !dayNumber ||
//   //   !dayType ||
//   //   !startTime ||
//   //   !endTime ||
//   //   !breakTime ||
//   //   !gracePeriod
//   // ) {
//   //   throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
//   // }

//   // Validate time format (HH:MM)
//   const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
//   if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Time format must be HH:MM (e.g., 08:00, 17:30)"
//     );
//   }

//   // Verify the shift exists and belongs to the company
//   const shift = await prisma.shift.findFirst({
//     where: { id: shiftId, companyId, isActive: true },
//   });

//   if (!shift) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
//   }

//   // Check if day number is within cycle days
//   if (dayNumber < 1 || dayNumber > shift.cycleDays) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       `Day number must be between 1 and ${shift.cycleDays}`
//     );
//   }

//   // Check for duplicate day number for this shift
//   const existing = await prisma.shiftDay.findFirst({
//     where: { shiftId, dayNumber },
//   });

//   if (existing) {
//     throw new ApiError(
//       httpStatus.CONFLICT,
//       "Day number already exists for this shift"
//     );
//   }

//   // Convert time strings to DateTime (using today's date as base)
//   const today = new Date();
//   const [startHour, startMinute] = startTime.split(":").map(Number);
//   const [endHour, endMinute] = endTime.split(":").map(Number);

//   const startDateTime = new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate(),
//     startHour,
//     startMinute
//   );
//   const endDateTime = new Date(
//     today.getFullYear(),
//     today.getMonth(),
//     today.getDate(),
//     endHour,
//     endMinute
//   );

//   return prisma.shiftDay.create({
//     data: {
//       shiftId,
//       dayNumber,
//       dayType,
//       startTime: startDateTime,
//       endTime: endDateTime,
//       breakTime,
//       gracePeriod,
//     },
//     include: {
//       shift: true,
//     },
//   });
// };

const createShiftDay = async (data: {
  shiftId: string;
  dayNumber: number;
  dayType: "FULL_DAY" | "HALF_DAY" | "REST_DAY" | "NIGHT" | string; // include string to catch invalid ones
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  breakTime: number;
  gracePeriod: number;
  companyId: string;
}) => {
  const {
    shiftId,
    dayNumber,
    dayType,
    startTime,
    endTime,
    breakTime,
    gracePeriod,
    companyId,
  } = data;

  console.log("Request Data:", data);

  // ✅ Step 1: Required field validation
  const requiredFields = {
    shiftId,
    dayNumber,
    dayType,
    startTime,
    endTime,
    breakTime,
    gracePeriod,
  };

  for (const [fieldName, value] of Object.entries(requiredFields)) {
    if (value === undefined || value === null || value === "") {
      throw new ApiError(httpStatus.BAD_REQUEST, `${fieldName} is required`);
    }
  }

  // ✅ Step 2: Enum validation for dayType
  const validDayTypes = ["FULL_DAY", "HALF_DAY", "REST_DAY", "NIGHT"];
  if (!validDayTypes.includes(dayType)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid dayType '${dayType}'. Expected one of: ${validDayTypes.join(
        ", "
      )}`
    );
  }

  // ✅ Step 3: Validate time format (HH:MM)
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Time format must be HH:MM (e.g., 08:00, 17:30)"
    );
  }

  // ✅ Step 4: Verify the shift exists and belongs to the company
  const shift = await prisma.shift.findFirst({
    where: { id: shiftId, companyId, isActive: true },
  });

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  // ✅ Step 5: Check if dayNumber is within cycleDays
  if (dayNumber < 1 || dayNumber > shift.cycleDays) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `dayNumber must be between 1 and ${shift.cycleDays}`
    );
  }

  // ✅ Step 6: Check for duplicate dayNumber for the shift
  const existing = await prisma.shiftDay.findFirst({
    where: { shiftId, dayNumber },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "The specified day  already exists for this shift schedule."
    );
  }

  // ✅ Step 7: Convert HH:MM strings to Date objects
  const today = new Date();
  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);

  const startDateTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    startHour,
    startMinute
  );

  const endDateTime = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    endHour,
    endMinute
  );

  // ✅ Step 8: Create shift day in DB
  return prisma.shiftDay.create({
    data: {
      shiftId,
      dayNumber,
      dayType: dayType as "FULL_DAY" | "HALF_DAY" | "REST_DAY" | "NIGHT", // safe cast
      startTime: startDateTime,
      endTime: endDateTime,
      breakTime,
      gracePeriod,
    },
    include: {
      shift: true,
    },
  });
};
const getAllShiftDays = async (companyId: string, shiftId?: string) => {
  const where: any = {
    shift: {
      companyId,
      isActive: true,
    },
  };

  if (shiftId) {
    where.shiftId = shiftId;
  }

  return prisma.shiftDay.findMany({
    where,
    include: {
      shift: true,
    },
    orderBy: [{ shiftId: "asc" }, { dayNumber: "asc" }],
  });
};

const getShiftDayById = async (id: string) => {
  return prisma.shiftDay.findUnique({
    where: { id },
    include: {
      shift: {
        include: {
          company: true,
        },
      },
    },
  });
};

const updateShiftDay = async (
  id: string,
  data: Partial<{
    dayNumber: number;
    dayType: "FULL_DAY" | "HALF_DAY" | "REST_DAY" | "NIGHT";
    startTime: string;
    endTime: string;
    breakTime: number;
    gracePeriod: number;
  }>
) => {
  const existing = await prisma.shiftDay.findUnique({
    where: { id },
    include: { shift: true },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift day not found");
  }

  // If updating day number, check for duplicates
  if (data.dayNumber && data.dayNumber !== existing.dayNumber) {
    const duplicate = await prisma.shiftDay.findFirst({
      where: {
        shiftId: existing.shiftId,
        dayNumber: data.dayNumber,
        id: { not: id },
      },
    });

    if (duplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Day number already exists for this shift"
      );
    }

    // Check if day number is within cycle days
    if (data.dayNumber < 1 || data.dayNumber > existing.shift.cycleDays) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Day number must be between 1 and ${existing.shift.cycleDays}`
      );
    }
  }

  // Convert time strings to DateTime if provided
  const updateData: any = { ...data };

  if (data.startTime) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.startTime)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Start time format must be HH:MM (e.g., 08:00, 17:30)"
      );
    }
    const today = new Date();
    const [startHour, startMinute] = data.startTime.split(":").map(Number);
    updateData.startTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      startHour,
      startMinute
    );
  }

  if (data.endTime) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(data.endTime)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "End time format must be HH:MM (e.g., 08:00, 17:30)"
      );
    }
    const today = new Date();
    const [endHour, endMinute] = data.endTime.split(":").map(Number);
    updateData.endTime = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      endHour,
      endMinute
    );
  }

  return prisma.shiftDay.update({
    where: { id },
    data: updateData,
    include: {
      shift: true,
    },
  });
};

const deleteShiftDay = async (id: string) => {
  const existing = await prisma.shiftDay.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift day not found");
  }

  return prisma.shiftDay.delete({
    where: { id },
  });
};

export default {
  createShiftDay,
  getAllShiftDays,
  getShiftDayById,
  updateShiftDay,
  deleteShiftDay,
};
