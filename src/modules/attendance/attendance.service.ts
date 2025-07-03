import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

// const createAttendance = async (data: {
//   employeeId: string;
//   checkTime: Date;
//   checkType?: string;
//   verifyMode?: number;
//   workCode?: number;
//   sensorId?: string;
//   deviceIp?: string;
// }) => {
//   const { employeeId, checkTime } = data;

//   if (!employeeId || !checkTime) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
//   }

//   return await prisma.attendance.create({
//     data,
//   });
// };

const createAttendance = async (data: {
  employeeId: string;
  date: Date | string; // can be ISO string or Date object
  checkTime?: Date;
  checkType?: string;
  verifyMode?: number;
  workCode?: number;
  sensorId?: string;
  deviceIp?: string;
  isAbsent?: boolean;
}) => {
  const {
    employeeId,
    date,
    checkTime,
    checkType,
    verifyMode,
    workCode,
    sensorId,
    deviceIp,
    isAbsent = false,
  } = data;

  // Ensure employeeId and date are valid
  const normalizedDate = new Date(date);
  if (!employeeId || !normalizedDate || isNaN(normalizedDate.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Employee ID and a valid date are required");
  }

  // Validate required fields for present employees
  if (!isAbsent) {
    if (!checkTime || !checkType) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "checkTime and checkType are required for present attendance"
      );
    }
  }

  // Prevent duplicate attendance for the same day
  const existing = await prisma.attendance.findUnique({
    where: {
      employeeId_date: {
        employeeId,
        date: normalizedDate,
      },
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Attendance already recorded for this date");
  }

  // Create attendance record
  return await prisma.attendance.create({
    data: {
      employeeId,
      date: normalizedDate,
      checkTime: isAbsent ? undefined : checkTime,
      checkType: isAbsent ? undefined : checkType,
      verifyMode,
      workCode,
      sensorId,
      deviceIp,
      isAbsent,
    },
  });
};
const getAllAttendanceLogs = async (employeeId: string) => {
  return prisma.attendance.findMany({
    where: { employeeId },
    orderBy: { checkTime: "desc" },
  });
};

const getAttendanceById = async (id: string) => {
  return prisma.attendance.findUnique({
    where: { id },
    include: { employee: true },
  });
};

export default {
  createAttendance,
  getAllAttendanceLogs,
  getAttendanceById,
};
