import prisma from "../../client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import { IWorkSessionWithRelations } from "./updatedAttendance.type";
import { formatDate, formatTime, formatDuration } from "./timeUtils";
import { string } from "zod";
import { phoneNumber } from "../../validations/security";

// Type assertion for Prisma client to include new models
const prismaWithModels = prisma as any;

// Interface for date range query
interface DateRangeQuery {
  startDate: string;
  endDate: string;
  deviceUserId?: string;
  shiftId?: string;
  companyId?: string;
}

// Interface for single date query
interface SingleDateQuery {
  date: string;
  deviceUserId?: string;
  shiftId?: string;
  companyId?: string;
}

// Interface for attendance summary
interface AttendanceSummary {
  totalSessions: number;
  totalEmployees: number;
  totalHours: number;
  averageSessionDuration: number;
  earlyArrivals: number;
  lateDepartures: number;
  overtimeRecords: number;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

// Interface for enhanced attendance response
interface EnhancedAttendanceResponse {
  summary: AttendanceSummary;
  sessions: EnhancedSession[];
}

// Interface for enhanced session
interface EnhancedSession {
  id: any;
  employeeName: string;
  phoneNumber: string;
  date: Date;
  punchIn: string | null;
  punchOut: string | null;
  punchInSource: any;
  punchOutSource: any;
  durationMinutes: number;
  durationHours: number;
  durationFormatted: string;
  shiftType: any;
}

// Get attendance by date range
const getAttendanceByDateRange = async (
  query: DateRangeQuery
): Promise<EnhancedSession[]> => {
  console.log("=== Getting Attendance by Date Range ===");
  console.log("Query:", query);

  const { startDate, endDate, deviceUserId, shiftId, companyId } = query;

  // Parse dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
  }

  if (start > end) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Start date must be before end date"
    );
  }

  // Build where clause
  const where: any = {
    date: {
      gte: start,
      lte: end,
    },
  };

  if (deviceUserId) {
    where.deviceUserId = deviceUserId;
  }

  if (shiftId) {
    where.shiftId = shiftId;
  }

  // Get all employees with deviceUserId for the company
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
      phoneNumber: true,
    },
    where: {
      deviceUserId: { not: null },
      ...(companyId && { companyId: companyId }),
    },
  });

  const deviceUserIdMap: Record<
    string,
    { id: string; name: string; phoneNumber: string }
  > = {};
  const companyDeviceUserIds: string[] = [];

  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
        phoneNumber: emp.phoneNumber,
      };
      companyDeviceUserIds.push(emp.deviceUserId);
    }
  }

  // If companyId is provided, filter work sessions by deviceUserIds that belong to the company
  if (companyId && companyDeviceUserIds.length > 0) {
    where.deviceUserId = { in: companyDeviceUserIds };
  }

  // Get work sessions
  const workSessions = await prisma.workSession.findMany({
    where,
    include: {
      shift: { select: { id: true, name: true, shiftType: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  console.log(`Found ${workSessions.length} work sessions in date range`);

  // Helper function to format time as HH:mm:ss
  const formatTime = (date: Date | null): string | null => {
    if (!date) return null;
    const d = new Date(date);
    return d.toTimeString().split(" ")[0]; // "HH:mm:ss"
  };

  // Transform sessions and calculate duration
  const enhancedSessions = workSessions.map((ws: any) => {
    let durationMinutes = 0;
    let durationFormatted = "00:00:00";

    if (ws.punchIn && ws.punchOut) {
      durationMinutes = Math.floor(
        (new Date(ws.punchOut).getTime() - new Date(ws.punchIn).getTime()) /
          (1000 * 60)
      );

      const hours = Math.floor(durationMinutes / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (durationMinutes % 60).toString().padStart(2, "0");
      const seconds = "00";
      durationFormatted = `${hours}:${minutes}:${seconds}`;
    }

    const employeeInfo = deviceUserIdMap[ws.deviceUserId] || {
      id: "unknown",
      name: "Unknown Employee",
      phoneNumber: "N/A",
    };

    return {
      id: ws.id,
      date: ws.date,
      employeeName: employeeInfo.name,
      phoneNumber: employeeInfo.phoneNumber,
      punchIn: formatTime(ws.punchIn),
      punchOut: formatTime(ws.punchOut),
      punchInSource: ws.punchInSource,
      punchOutSource: ws.punchOutSource,
      durationMinutes,
      durationHours: +(durationMinutes / 60).toFixed(2),
      durationFormatted,
      shiftType: ws.shift?.shiftType || "N/A",
    };
  });

  return enhancedSessions;
};
const getTodaysAttendance = async (filters: {
  deviceUserId?: string;
  date?: string | Date;
  shiftId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  companyId?: string;
}): Promise<EnhancedSession[]> => {
  console.log("=== Getting Today's Attendance ===111");
  console.log("Filters:", filters);

  const where: any = {};

  // Handle date filtering
  if (filters.date) {
    const dateObj =
      filters.date instanceof Date ? filters.date : new Date(filters.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    where.date = { gte: startOfDay, lte: endOfDay };
  } else if (filters.startDate && filters.endDate) {
    where.date = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };
  } else {
    // default to today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);
    where.date = { gte: todayStart, lte: todayEnd };
  }

  if (filters.deviceUserId) {
    where.deviceUserId = filters.deviceUserId;
  }
  if (filters.shiftId) {
    where.shiftId = filters.shiftId;
  }

  // Get all employees with deviceUserId for the company
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
      phoneNumber: true,
    },
    where: {
      deviceUserId: { not: null },
      ...(filters.companyId && { companyId: filters.companyId }),
    },
  });

  const deviceUserIdMap: Record<
    string,
    { id: string; name: string; phoneNumber: string }
  > = {};
  const companyDeviceUserIds: string[] = [];

  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
        phoneNumber: emp.phoneNumber,
      };
      companyDeviceUserIds.push(emp.deviceUserId);
    }
  }

  if (filters.companyId && companyDeviceUserIds.length > 0) {
    where.deviceUserId = { in: companyDeviceUserIds };
  }

  // Get work sessions
  const workSessions = await prisma.workSession.findMany({
    where,
    include: {
      shift: { select: { id: true, name: true, shiftType: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  console.log(`Found ${workSessions.length} work sessions`);

  // Helper function to format time as HH:mm:ss
  const formatTime = (date: Date | null): string | null => {
    if (!date) return null;
    const d = new Date(date);
    return d.toTimeString().split(" ")[0]; // "HH:mm:ss"
  };

  // Transform sessions and calculate duration
  const enhancedSessions: EnhancedSession[] = workSessions.map((ws: any) => {
    let durationMinutes = 0;
    let durationFormatted = "00:00:00";

    if (ws.punchIn && ws.punchOut) {
      durationMinutes = Math.floor(
        (new Date(ws.punchOut).getTime() - new Date(ws.punchIn).getTime()) /
          (1000 * 60)
      );

      const hours = Math.floor(durationMinutes / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (durationMinutes % 60).toString().padStart(2, "0");
      const seconds = "00";
      durationFormatted = `${hours}:${minutes}:${seconds}`;
    }

    const employeeInfo = deviceUserIdMap[ws.deviceUserId] || {
      id: "unknown",
      name: "Unknown Employee",
      phoneNumber: "N/A",
    };

    return {
      id: ws.id,
      date: ws.date, // ✅ added this field
      employeeName: employeeInfo.name,
      phoneNumber: employeeInfo.phoneNumber,
      punchIn: formatTime(ws.punchIn),
      punchOut: formatTime(ws.punchOut),
      punchInSource: ws.punchInSource,
      punchOutSource: ws.punchOutSource,
      durationMinutes,
      durationHours: +(durationMinutes / 60).toFixed(2),
      durationFormatted,
      shiftType: ws.shift?.shiftType || "N/A",
    };
  });

  return enhancedSessions;
};

// Get weekly attendance (current week)
const getWeeklyAttendance = async (query: {
  deviceUserId?: string;
  shiftId?: string;
  companyId?: string;
}): Promise<EnhancedSession[]> => {
  console.log("=== Getting Weekly Attendance ===");

  const today = new Date();
  const startOfWeek = new Date(today);
  const endOfWeek = new Date(today);

  // Get start of week (Monday)
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  startOfWeek.setDate(today.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);

  // Get end of week (Sunday)
  const daysToSunday = 7 - dayOfWeek;
  endOfWeek.setDate(today.getDate() + daysToSunday);
  endOfWeek.setHours(23, 59, 59, 999);

  return await getAttendanceByDateRange({
    startDate: startOfWeek.toISOString().split("T")[0],
    endDate: endOfWeek.toISOString().split("T")[0],
    deviceUserId: query.deviceUserId,
    shiftId: query.shiftId,
    companyId: query.companyId,
  });
};

// Get monthly attendance (current month)
const getMonthlyAttendance = async (query: {
  deviceUserId?: string;
  shiftId?: string;
  companyId?: string;
}): Promise<EnhancedSession[]> => {
  console.log("=== Getting Monthly Attendance ===");

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );

  return await getAttendanceByDateRange({
    startDate: startOfMonth.toISOString().split("T")[0],
    endDate: endOfMonth.toISOString().split("T")[0],
    deviceUserId: query.deviceUserId,
    shiftId: query.shiftId,
    companyId: query.companyId,
  });
};

// Get yearly attendance (current year)
const getYearlyAttendance = async (query: {
  deviceUserId?: string;
  shiftId?: string;
  companyId?: string;
}): Promise<EnhancedSession[]> => {
  console.log("=== Getting Yearly Attendance ===");

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);

  return await getAttendanceByDateRange({
    startDate: startOfYear.toISOString().split("T")[0],
    endDate: endOfYear.toISOString().split("T")[0],
    deviceUserId: query.deviceUserId,
    shiftId: query.shiftId,
    companyId: query.companyId,
  });
};

// Get attendance by specific date
const getAttendanceByDate = async (
  query: SingleDateQuery
): Promise<EnhancedSession[]> => {
  console.log("=== Getting Attendance by Specific Date ===");

  return await getAttendanceByDateRange({
    startDate: query.date,
    endDate: query.date,
    deviceUserId: query.deviceUserId,
    shiftId: query.shiftId,
    companyId: query.companyId,
  });
};

// Get attendance summary
const getAttendanceSummary = async (
  query: DateRangeQuery
): Promise<EnhancedAttendanceResponse> => {
  console.log("=== Getting Attendance Summary ===");
  console.log("Query:", query);

  const { startDate, endDate, deviceUserId, shiftId, companyId } = query;

  // Parse dates
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
  }

  if (start > end) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Start date must be before end date"
    );
  }

  // Build where clause
  const where: any = {
    date: {
      gte: start,
      lte: end,
    },
  };

  if (deviceUserId) {
    where.deviceUserId = deviceUserId;
  }

  if (shiftId) {
    where.shiftId = shiftId;
  }

  // Get all employees with deviceUserId for the company
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
      phoneNumber: true,
    },
    where: {
      deviceUserId: { not: null },
      ...(companyId && { companyId: companyId }),
    },
  });

  const deviceUserIdMap: Record<
    string,
    { id: string; name: string; phoneNumber: string }
  > = {};
  const companyDeviceUserIds: string[] = [];

  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
        phoneNumber: emp.phoneNumber,
      };
      companyDeviceUserIds.push(emp.deviceUserId);
    }
  }

  // If companyId is provided, filter work sessions by deviceUserIds that belong to the company
  if (companyId && companyDeviceUserIds.length > 0) {
    where.deviceUserId = { in: companyDeviceUserIds };
  }

  // Get work sessions for summary
  const workSessions = await prisma.workSession.findMany({
    where,
    include: {
      shift: { select: { id: true, name: true, shiftType: true } },
    },
  });

  // Get overtime records for summary
  const overtimeWhere: any = {
    date: {
      gte: start,
      lte: end,
    },
  };

  if (deviceUserId) {
    overtimeWhere.deviceUserId = deviceUserId;
  }

  if (companyId && companyDeviceUserIds.length > 0) {
    overtimeWhere.deviceUserId = { in: companyDeviceUserIds };
  }

  const overtimeRecords = await prisma.overtimeTable.findMany({
    where: overtimeWhere,
  });

  // Calculate summary statistics
  const totalSessions = workSessions.length;
  const uniqueEmployees = new Set(
    workSessions.map((session: any) => session.deviceUserId)
  ).size;

  let totalHours = 0;
  let totalDuration = 0;
  let earlyArrivals = 0;
  let lateDepartures = 0;

  workSessions.forEach((session: any) => {
    if (session.duration) {
      totalDuration += session.duration;
      totalHours += session.duration / 60; // Convert minutes to hours
    }
  });

  // Count overtime types
  overtimeRecords.forEach((overtime: any) => {
    if (overtime.type === "UNSCHEDULED" || overtime.type === "EARLY_ARRIVAL") {
      earlyArrivals++;
    }
    if (
      overtime.type === "EXTENDED_SHIFT" ||
      overtime.type === "LATE_DEPARTURE"
    ) {
      lateDepartures++;
    }
  });

  const averageSessionDuration =
    totalSessions > 0 ? totalDuration / totalSessions : 0;

  // Helper function to format time as HH:mm:ss
  const formatTime = (date: Date | null): string | null => {
    if (!date) return null;
    const d = new Date(date);
    return d.toTimeString().split(" ")[0]; // "HH:mm:ss"
  };

  // Transform sessions and calculate duration
  const enhancedSessions = workSessions.map((ws: any) => {
    let durationMinutes = 0;
    let durationFormatted = "00:00:00";

    if (ws.punchIn && ws.punchOut) {
      durationMinutes = Math.floor(
        (new Date(ws.punchOut).getTime() - new Date(ws.punchIn).getTime()) /
          (1000 * 60)
      );

      const hours = Math.floor(durationMinutes / 60)
        .toString()
        .padStart(2, "0");
      const minutes = (durationMinutes % 60).toString().padStart(2, "0");
      const seconds = "00";
      durationFormatted = `${hours}:${minutes}:${seconds}`;
    }

    const employeeInfo = deviceUserIdMap[ws.deviceUserId] || {
      id: "unknown",
      name: "Unknown Employee",
      phoneNumber: "N/A",
    };

    return {
      id: ws.id,
      date: ws.date,
      employeeName: employeeInfo.name,
      phoneNumber: employeeInfo.phoneNumber,
      punchIn: formatTime(ws.punchIn),
      punchOut: formatTime(ws.punchOut),
      punchInSource: ws.punchInSource,
      punchOutSource: ws.punchOutSource,
      durationMinutes,
      durationHours: +(durationMinutes / 60).toFixed(2),
      durationFormatted,
      shiftType: ws.shift?.shiftType || "N/A",
    };
  });

  const summary: AttendanceSummary = {
    totalSessions,
    totalEmployees: uniqueEmployees,
    totalHours: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
    averageSessionDuration: Math.round(averageSessionDuration),
    earlyArrivals,
    lateDepartures,
    overtimeRecords: overtimeRecords.length,
    dateRange: {
      startDate: startDate,
      endDate: endDate,
    },
  };

  console.log("Summary calculated:", summary);

  return {
    summary,
    sessions: enhancedSessions,
  };
};

// Helper function to transform work session for response
const transformWorkSessionForResponse = (
  workSession: any
): IWorkSessionWithRelations => {
  return {
    ...workSession,
    punchInTime: workSession.punchIn ? formatTime(workSession.punchIn) : null,
    punchOutTime: workSession.punchOut
      ? formatTime(workSession.punchOut)
      : null,
    dateFormatted: formatDate(workSession.date),
    durationFormatted: workSession.duration
      ? formatDuration(workSession.duration)
      : null,
    OvertimeTable:
      workSession.OvertimeTable?.map((overtime: any) => ({
        ...overtime,
        punchInTime: overtime.punchIn ? formatTime(overtime.punchIn) : null,
        punchOutTime: overtime.punchOut ? formatTime(overtime.punchOut) : null,
        durationFormatted: overtime.duration
          ? formatDuration(overtime.duration)
          : null,
      })) || [],
  };
};

// Enhanced attendance service object
const enhancedAttendanceService = {
  getAttendanceByDateRange,
  getTodaysAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getYearlyAttendance,
  getAttendanceByDate,
  getAttendanceSummary,
};

export default enhancedAttendanceService;
