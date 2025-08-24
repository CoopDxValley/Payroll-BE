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
  deductibleMinutes?: number;
  deductibleHours?: number;
  deductibleFormatted?: string;
  overtimeMinutes?: number;
  overtimeHours?: number;
  overtimeFormatted?: string;
  netWorkingMinutes?: number;
  netWorkingHours?: number;
  netWorkingFormatted?: string;
  shiftType: any;
}

// Interface for payroll definition summary
interface PayrollSummaryEmployee {
  id: string;
  name: string;
  totalWorkingHours: number;
  overtimeHours: number;
  deductibleHours: number;
  netHoursWorked: number;
}
// Get attendance by date range
// const getAttendanceByDateRange = async (
//   query: DateRangeQuery
// ): Promise<EnhancedSession[]> => {
//   console.log("=== Getting Attendance by Date Range ===");
//   console.log("Query:", query);
const getAttendanceByDateRange = async (
  query: DateRangeQuery & { departmentId?: string } // 👈 extended type
): Promise<EnhancedSession[]> => {
  console.log("=== Getting Attendance by Date Range ===");
  console.log("Query:", query);

  const { startDate, endDate, deviceUserId, shiftId, companyId, departmentId } =
    query;

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

  // Build where clause for work sessions
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

  // 🔑 Filter employees at DB level
  const employees = await prisma.employee.findMany({
    where: {
      deviceUserId: { not: null },
      ...(companyId && { companyId }),
      ...(departmentId && {
        departmentHistory: {
          some: {
            departmentId,
            toDate: null, // only active department
          },
        },
      }),
    },
    select: {
      id: true,
      name: true,
      deviceUserId: true,
      phoneNumber: true,
      departmentHistory: {
        where: { toDate: null },
        include: { department: true },
      },
      positionHistory: {
        where: { toDate: null },
        include: { position: true },
      },
    },
  });

  // Build a lookup map for deviceUserIds
  const deviceUserIdMap: Record<
    string,
    {
      id: string;
      name: string;
      phoneNumber: string;
      departmentName: string | null;
      positionName: string | null;
    }
  > = {};
  const companyDeviceUserIds: string[] = [];

  for (const emp of employees) {
    if (emp.deviceUserId) {
      deviceUserIdMap[emp.deviceUserId] = {
        id: emp.id,
        name: emp.name,
        phoneNumber: emp.phoneNumber,
        departmentName: emp.departmentHistory[0]?.department?.deptName || null,
        positionName: emp.positionHistory[0]?.position?.positionName || null,
      };
      companyDeviceUserIds.push(emp.deviceUserId);
    }
  }

  // 🔑 Ensure we only pull sessions of employees in filtered department/company
  if (companyDeviceUserIds.length > 0) {
    where.deviceUserId = { in: companyDeviceUserIds };
  } else {
    // If no employees matched filter, return empty
    return [];
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
      departmentName: null,
      positionName: null,
    };

    return {
      id: ws.id,
      date: ws.date,
      employeeName: employeeInfo.name,
      departmentName: employeeInfo.departmentName || "Unassigned",
      positionName: employeeInfo.positionName || "Unassigned",
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

// const getAttendanceByDateRange = async (
//   query: DateRangeQuery & { departmentId?: string } // 👈 extend type
// ): Promise<EnhancedSession[]> => {
//   console.log("=== Getting Attendance by Date Range ===");
//   console.log("Query:", query);
//   const { startDate, endDate, deviceUserId, shiftId, companyId, departmentId } =
//     query;

//   // Parse dates
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
//   }

//   if (start > end) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Start date must be before end date"
//     );
//   }

//   // Build where clause
//   const where: any = {
//     date: {
//       gte: start,
//       lte: end,
//     },
//   };

//   if (deviceUserId) {
//     where.deviceUserId = deviceUserId;
//   }

//   if (shiftId) {
//     where.shiftId = shiftId;
//   }

//   // Get all employees with deviceUserId for the company + active department + active position
//   // const employees = await prisma.employee.findMany({
//   //   where: {
//   //     deviceUserId: { not: null },
//   //     ...(companyId && { companyId: companyId }),
//   //   },
//   //   select: {
//   //     id: true,
//   //     name: true,
//   //     deviceUserId: true,
//   //     phoneNumber: true,
//   //     departmentHistory: {
//   //       where: { toDate: null },
//   //       include: { department: true },
//   //     },
//   //     positionHistory: {
//   //       where: { toDate: null },
//   //       include: { position: true },
//   //     },
//   //   },
//   // });
//   const employees = await prisma.employee.findMany({
//     where: {
//       deviceUserId: { not: null },
//       ...(companyId && { companyId }),
//       ...(departmentId && {
//         departmentHistory: {
//           some: {
//             departmentId: departmentId,
//             toDate: null, // 👈 only active department
//           },
//         },
//       }),
//     },
//     select: {
//       id: true,
//       name: true,
//       deviceUserId: true,
//       phoneNumber: true,
//       departmentHistory: {
//         where: { toDate: null },
//         include: { department: true },
//       },
//       positionHistory: {
//         where: { toDate: null },
//         include: { position: true },
//       },
//     },
//   });

//   const deviceUserIdMap: Record<
//     string,
//     {
//       id: string;
//       name: string;
//       phoneNumber: string;
//       departmentName: string | null;
//       positionName: string | null;
//     }
//   > = {};
//   const companyDeviceUserIds: string[] = [];

//   for (const emp of employees) {
//     if (emp.deviceUserId) {
//       deviceUserIdMap[emp.deviceUserId] = {
//         id: emp.id,
//         name: emp.name,
//         phoneNumber: emp.phoneNumber,
//         departmentName: emp.departmentHistory[0]?.department?.deptName || null,
//         positionName: emp.positionHistory[0]?.position?.positionName || null,
//       };
//       companyDeviceUserIds.push(emp.deviceUserId);
//     }
//   }

//   // If companyId is provided, filter work sessions by deviceUserIds that belong to the company
//   if (companyId && companyDeviceUserIds.length > 0) {
//     where.deviceUserId = { in: companyDeviceUserIds };
//   }

//   // Get work sessions
//   const workSessions = await prisma.workSession.findMany({
//     where,
//     include: {
//       shift: { select: { id: true, name: true, shiftType: true } },
//     },
//     orderBy: [{ date: "desc" }, { createdAt: "desc" }],
//   });

//   console.log(`Found ${workSessions.length} work sessions in date range`);

//   // Helper function to format time as HH:mm:ss
//   const formatTime = (date: Date | null): string | null => {
//     if (!date) return null;
//     const d = new Date(date);
//     return d.toTimeString().split(" ")[0]; // "HH:mm:ss"
//   };

//   // Transform sessions and calculate duration
//   const enhancedSessions = workSessions.map((ws: any) => {
//     let durationMinutes = 0;
//     let durationFormatted = "00:00:00";

//     if (ws.punchIn && ws.punchOut) {
//       durationMinutes = Math.floor(
//         (new Date(ws.punchOut).getTime() - new Date(ws.punchIn).getTime()) /
//           (1000 * 60)
//       );

//       const hours = Math.floor(durationMinutes / 60)
//         .toString()
//         .padStart(2, "0");
//       const minutes = (durationMinutes % 60).toString().padStart(2, "0");
//       const seconds = "00";
//       durationFormatted = `${hours}:${minutes}:${seconds}`;
//     }

//     const employeeInfo = deviceUserIdMap[ws.deviceUserId] || {
//       id: "unknown",
//       name: "Unknown Employee",
//       phoneNumber: "N/A",
//       departmentName: null,
//       positionName: null,
//     };

//     return {
//       id: ws.id,
//       date: ws.date,
//       employeeName: employeeInfo.name,
//       departmentName: employeeInfo.departmentName || "Unassigned",
//       positionName: employeeInfo.positionName || "Unassigned",
//       phoneNumber: employeeInfo.phoneNumber,
//       punchIn: formatTime(ws.punchIn),
//       punchOut: formatTime(ws.punchOut),
//       punchInSource: ws.punchInSource,
//       punchOutSource: ws.punchOutSource,
//       durationMinutes,
//       durationHours: +(durationMinutes / 60).toFixed(2),
//       durationFormatted,
//       shiftType: ws.shift?.shiftType || "N/A",
//     };
//   });

//   return enhancedSessions;
// };

// // Get attendance by date range
// const getAttendanceByDateRange = async (
//   query: DateRangeQuery
// ): Promise<EnhancedSession[]> => {
//   console.log("=== Getting Attendance by Date Range ===");
//   console.log("Query:", query);

//   const { startDate, endDate, deviceUserId, shiftId, companyId } = query;

//   // Parse dates
//   const start = new Date(startDate);
//   const end = new Date(endDate);

//   if (isNaN(start.getTime()) || isNaN(end.getTime())) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid date format");
//   }

//   if (start > end) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Start date must be before end date"
//     );
//   }

//   // Build where clause
//   const where: any = {
//     date: {
//       gte: start,
//       lte: end,
//     },
//   };

//   if (deviceUserId) {
//     where.deviceUserId = deviceUserId;
//   }

//   if (shiftId) {
//     where.shiftId = shiftId;
//   }

//   // Get all employees with deviceUserId for the company
//   const employees = await prisma.employee.findMany({
//     select: {
//       id: true,
//       name: true,
//       deviceUserId: true,
//       phoneNumber: true,
//     },
//     where: {
//       deviceUserId: { not: null },
//       ...(companyId && { companyId: companyId }),
//     },
//   });

//   const deviceUserIdMap: Record<
//     string,
//     { id: string; name: string; phoneNumber: string }
//   > = {};
//   const companyDeviceUserIds: string[] = [];

//   for (const emp of employees) {
//     if (emp.deviceUserId) {
//       deviceUserIdMap[emp.deviceUserId] = {
//         id: emp.id,
//         name: emp.name,
//         phoneNumber: emp.phoneNumber,
//       };
//       companyDeviceUserIds.push(emp.deviceUserId);
//     }
//   }

//   // If companyId is provided, filter work sessions by deviceUserIds that belong to the company
//   if (companyId && companyDeviceUserIds.length > 0) {
//     where.deviceUserId = { in: companyDeviceUserIds };
//   }

//   // Get work sessions
//   const workSessions = await prisma.workSession.findMany({
//     where,
//     include: {
//       shift: { select: { id: true, name: true, shiftType: true } },
//     },
//     orderBy: [{ date: "desc" }, { createdAt: "desc" }],
//   });

//   console.log(`Found ${workSessions.length} work sessions in date range`);

//   // Helper function to format time as HH:mm:ss
//   const formatTime = (date: Date | null): string | null => {
//     if (!date) return null;
//     const d = new Date(date);
//     return d.toTimeString().split(" ")[0]; // "HH:mm:ss"
//   };

//   // Transform sessions and calculate duration
//   const enhancedSessions = workSessions.map((ws: any) => {
//     let durationMinutes = 0;
//     let durationFormatted = "00:00:00";

//     if (ws.punchIn && ws.punchOut) {
//       durationMinutes = Math.floor(
//         (new Date(ws.punchOut).getTime() - new Date(ws.punchIn).getTime()) /
//           (1000 * 60)
//       );

//       const hours = Math.floor(durationMinutes / 60)
//         .toString()
//         .padStart(2, "0");
//       const minutes = (durationMinutes % 60).toString().padStart(2, "0");
//       const seconds = "00";
//       durationFormatted = `${hours}:${minutes}:${seconds}`;
//     }

//     const employeeInfo = deviceUserIdMap[ws.deviceUserId] || {
//       id: "unknown",
//       name: "Unknown Employee",
//       phoneNumber: "N/A",
//     };

//     return {
//       id: ws.id,
//       date: ws.date,
//       employeeName: employeeInfo.name,

//       departmentName: employeeInfo?.departmentName || "Unassigned",
//       positionName: employeeInfo?.positionName || "Unassigned",
//       phoneNumber: employeeInfo.phoneNumber,
//       punchIn: formatTime(ws.punchIn),
//       punchOut: formatTime(ws.punchOut),
//       punchInSource: ws.punchInSource,
//       punchOutSource: ws.punchOutSource,
//       durationMinutes,
//       durationHours: +(durationMinutes / 60).toFixed(2),
//       durationFormatted,
//       // deductedMinutes:ws.d
//       shiftType: ws.shift?.shiftType || "N/A",
//     };
//   });

//   return enhancedSessions;
// };

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

// Get monthly attendance (current month) with deductible and overtime data
const getMonthlyAttendance = async (query: {
  deviceUserId?: string;
  shiftId?: string;
  companyId?: string;
  departmentId?: string;
}): Promise<EnhancedSession[]> => {
  console.log("=== Getting Monthly Attendance with Deductible & Overtime ===");

  // const today = new Date();
  // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  // const endOfMonth = new Date(
  //   today.getFullYear(),
  //   today.getMonth() + 1,
  //   0,
  //   23,
  //   59,
  //   59,
  //   999
  // );
  // Fetch the current payroll definition for the company
  const payrollDef = await prisma.payrollDefinition.findFirst({
    where: {
      companyId: query.companyId,
    },
    orderBy: { startDate: "desc" },
  });

  if (!payrollDef) {
    throw new Error("No payroll definition found for the company");
  }

  const startOfMonth = payrollDef.startDate;
  const endOfMonth = payrollDef.endDate;
  // Get basic attendance data
  const sessions = await getAttendanceByDateRange({
    startDate: startOfMonth.toISOString().split("T")[0],
    endDate: endOfMonth.toISOString().split("T")[0],
    deviceUserId: query.deviceUserId,
    shiftId: query.shiftId,
    companyId: query.companyId,
    departmentId: query.departmentId,
  });

  // Get work sessions with deductible minutes
  const where: any = {
    date: {
      gte: startOfMonth,
      lte: endOfMonth,
    },
  };

  if (query.deviceUserId) {
    where.deviceUserId = query.deviceUserId;
  }
  if (query.shiftId) {
    where.shiftId = query.shiftId;
  }

  // Get employees for company filtering
  if (query.companyId) {
    const employees = await prisma.employee.findMany({
      select: { deviceUserId: true },
      where: {
        companyId: query.companyId,
        deviceUserId: { not: null },
      },
    });
    const companyDeviceUserIds = employees
      .map((emp) => emp.deviceUserId)
      .filter((id) => id !== null) as string[];

    if (companyDeviceUserIds.length > 0) {
      where.deviceUserId = { in: companyDeviceUserIds };
    }
  }

  const workSessions = await prisma.workSession.findMany({
    where,
  });

  // Get approved overtime records for the month
  const overtimeWhere = { ...where };
  const overtimeRecords = await prisma.overtimeTable.findMany({
    where: {
      ...overtimeWhere,
      status: "APPROVED", // Only approved overtime
    },
    select: {
      deviceUserId: true,
      date: true,
      duration: true,
    },
  });

  // Create maps for quick lookup
  const deductibleMap = new Map<string, number>();
  const overtimeMap = new Map<string, number>();

  // Process work sessions for deductible minutes
  workSessions.forEach((ws) => {
    const key = `${ws.deviceUserId}-${ws.date.toISOString().split("T")[0]}`;
    // TODO: Add dedutedMinutes field to WorkSession model, for now using 0
    deductibleMap.set(key, 0); // Will be updated when dedutedMinutes field is added
  });

  // Process overtime records
  overtimeRecords.forEach((ot) => {
    const key = `${ot.deviceUserId}-${ot.date.toISOString().split("T")[0]}`;
    const existing = overtimeMap.get(key) || 0;
    overtimeMap.set(key, existing + (ot.duration || 0));
  });

  // Enhance sessions with deductible and overtime data
  const enhancedSessions = sessions.map((session) => {
    // We need to find the corresponding employee info to get deviceUserId
    // Since sessions come from getAttendanceByDateRange, they don't have deviceUserId directly
    // We'll need to match by session properties or use a different approach

    // For now, we'll use simplified logic and set default values
    // TODO: Fix the mapping between sessions and deviceUserId
    const deductibleMinutes = 0; // Will be properly calculated when dedutedMinutes field is available
    const overtimeMinutes = 0; // Will be properly calculated when mapping is fixed

    // Calculate net working time
    const netWorkingMinutes = Math.max(
      0,
      session.durationMinutes - deductibleMinutes
    );

    return {
      ...session,
      deductibleMinutes,
      deductibleHours: +(deductibleMinutes / 60).toFixed(2),
      deductibleFormatted: formatMinutesToTime(deductibleMinutes),
      overtimeMinutes,
      overtimeHours: +(overtimeMinutes / 60).toFixed(2),
      overtimeFormatted: formatMinutesToTime(overtimeMinutes),
      netWorkingMinutes,
      netWorkingHours: +(netWorkingMinutes / 60).toFixed(2),
      netWorkingFormatted: formatMinutesToTime(netWorkingMinutes),
    };
  });

  return enhancedSessions;
};

// Helper function to format minutes to HH:mm:ss
const formatMinutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:00`;
};

// // Get payroll definition summary
// const getPayrollDefinitionSummary = async (query: {
//   companyId: string;
//   payrollDefinitionId?: string;
// }): Promise<PayrollSummaryEmployee[]> => {
//   console.log("=== Getting Payroll Definition Summary ===");

//   const { companyId, payrollDefinitionId } = query;

//   // Get current payroll definition if not specified
//   let payrollDef;
//   if (payrollDefinitionId) {
//     payrollDef = await prisma.payrollDefinition.findUnique({
//       where: { id: payrollDefinitionId },
//     });
//   } else {
//     // Get current/active payroll definition
//     payrollDef = await prisma.payrollDefinition.findFirst({
//       where: {
//         companyId,
//         status: 'active', // or whatever status indicates current
//       },
//       orderBy: { startDate: 'desc' },
//     });
//   }

//   if (!payrollDef) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "No active payroll definition found");
//   }

//   console.log("Using payroll definition:", payrollDef.payrollName, payrollDef.startDate, "to", payrollDef.endDate);

//   // Get all employees for the company
//   const employees = await prisma.employee.findMany({
//     select: {
//       id: true,
//       name: true,
//       deviceUserId: true,
//     },
//     where: {
//       companyId,
//       deviceUserId: { not: null },
//     },
//   });

//   const employeeDeviceUserIds = employees
//     .map(emp => emp.deviceUserId)
//     .filter(id => id !== null) as string[];

//   // Get work sessions for payroll period
//   const workSessions = await prisma.workSession.findMany({
//     where: {
//       deviceUserId: { in: employeeDeviceUserIds },
//       date: {
//         gte: payrollDef.startDate,
//         lte: payrollDef.endDate,
//       },
//     },
//     select: {
//       deviceUserId: true,
//       duration: true,
//       // TODO: include dedutedMinutes when field is added
//     },
//   });

//   // Get approved overtime for payroll period
//   const overtimeRecords = await prisma.overtimeTable.findMany({
//     where: {
//       deviceUserId: { in: employeeDeviceUserIds },
//       date: {
//         gte: payrollDef.startDate,
//         lte: payrollDef.endDate,
//       },
//       status: 'APPROVED',
//     },
//     select: {
//       deviceUserId: true,
//       duration: true,
//     },
//   });

//   // Calculate totals per employee
//   const employeeSummary: PayrollSummaryEmployee[] = employees.map(employee => {
//     if (!employee.deviceUserId) {
//       return {
//         id: employee.id,
//         name: employee.name,
//         totalWorkingHours: 0,
//         overtimeHours: 0,
//         deductibleHours: 0,
//         netHoursWorked: 0,
//       };
//     }

//     // Calculate total working hours
//     const employeeWorkSessions = workSessions.filter(ws => ws.deviceUserId === employee.deviceUserId);
//     const totalWorkingMinutes = employeeWorkSessions.reduce((total, ws) => {
//       return total + (ws.duration || 0);
//     }, 0);

//     // Calculate overtime hours
//     const employeeOvertime = overtimeRecords.filter(ot => ot.deviceUserId === employee.deviceUserId);
//     const overtimeMinutes = employeeOvertime.reduce((total, ot) => {
//       return total + (ot.duration || 0);
//     }, 0);

//     // Calculate deductible hours (TODO: implement when dedutedMinutes field is available)
//     const deductibleMinutes = 0; // Will be calculated when field is added

//     // Calculate net hours worked
//     const netWorkingMinutes = Math.max(0, totalWorkingMinutes - deductibleMinutes);

//     return {
//       id: employee.id,
//       name: employee.name,
//       totalWorkingHours: +(totalWorkingMinutes / 60).toFixed(2),
//       overtimeHours: +(overtimeMinutes / 60).toFixed(2),
//       deductibleHours: +(deductibleMinutes / 60).toFixed(2),
//       netHoursWorked: +(netWorkingMinutes / 60).toFixed(2),
//     };
//   });

//   return employeeSummary;
// };

// Get payroll definition summary
const getPayrollDefinitionSummary = async (query: {
  companyId: string;
  payrollDefinitionId?: string;
}): Promise<{
  payrollDefinition: any;
  employees: PayrollSummaryEmployee[];
}> => {
  console.log("=== Getting Payroll Definition Summary ===");

  const { companyId, payrollDefinitionId } = query;

  let payrollDef;
  if (payrollDefinitionId) {
    payrollDef = await prisma.payrollDefinition.findUnique({
      where: { id: payrollDefinitionId },
    });
  } else {
    // Get payroll definition that covers today's date
    const today = new Date();

    payrollDef = await prisma.payrollDefinition.findFirst({
      where: {
        companyId,
        startDate: { lte: today },
        endDate: { gte: today },
      },
      orderBy: { startDate: "desc" }, // in case multiple overlap, pick the latest
    });
  }

  if (!payrollDef) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No payroll definition found for the current date"
    );
  }

  console.log(
    "Using payroll definition:",
    payrollDef.payrollName,
    payrollDef.startDate,
    "to",
    payrollDef.endDate
  );

  // Get all employees for the company
  const employees = await prisma.employee.findMany({
    select: {
      id: true,
      name: true,
      deviceUserId: true,
    },
    where: {
      companyId,
      deviceUserId: { not: null },
    },
  });

  const employeeDeviceUserIds = employees
    .map((emp) => emp.deviceUserId)
    .filter((id) => id !== null) as string[];

  // Get work sessions for payroll period
  const workSessions = await prisma.workSession.findMany({
    where: {
      deviceUserId: { in: employeeDeviceUserIds },
      date: {
        gte: payrollDef.startDate,
        lte: payrollDef.endDate,
      },
    },
    select: {
      deviceUserId: true,
      duration: true,
    },
  });

  // Get approved overtime for payroll period
  const overtimeRecords = await prisma.overtimeTable.findMany({
    where: {
      deviceUserId: { in: employeeDeviceUserIds },
      date: {
        gte: payrollDef.startDate,
        lte: payrollDef.endDate,
      },
      status: "APPROVED",
    },
    select: {
      deviceUserId: true,
      duration: true,
    },
  });

  // Calculate totals per employee
  const employeeSummary: PayrollSummaryEmployee[] = employees.map(
    (employee) => {
      if (!employee.deviceUserId) {
        return {
          id: employee.id,
          name: employee.name,
          totalWorkingHours: 0,
          overtimeHours: 0,
          deductibleHours: 0,
          netHoursWorked: 0,
        };
      }

      // Calculate total working hours
      const employeeWorkSessions = workSessions.filter(
        (ws) => ws.deviceUserId === employee.deviceUserId
      );
      const totalWorkingMinutes = employeeWorkSessions.reduce((total, ws) => {
        return total + (ws.duration || 0);
      }, 0);

      // Calculate overtime hours
      const employeeOvertime = overtimeRecords.filter(
        (ot) => ot.deviceUserId === employee.deviceUserId
      );
      const overtimeMinutes = employeeOvertime.reduce((total, ot) => {
        return total + (ot.duration || 0);
      }, 0);

      // Deductible hours (future logic placeholder)
      const deductibleMinutes = 0;

      // Net working minutes
      const netWorkingMinutes = Math.max(
        0,
        totalWorkingMinutes - deductibleMinutes
      );

      return {
        id: employee.id,
        name: employee.name,
        totalWorkingHours: +(totalWorkingMinutes / 60).toFixed(2),
        overtimeHours: +(overtimeMinutes / 60).toFixed(2),
        deductibleHours: +(deductibleMinutes / 60).toFixed(2),
        netHoursWorked: +(netWorkingMinutes / 60).toFixed(2),
      };
    }
  );

  // ✅ Return payroll definition + summary
  return {
    payrollDefinition: {
      id: payrollDef.id,
      payrollName: payrollDef.payrollName,
      startDate: payrollDef.startDate,
      endDate: payrollDef.endDate,
      status: payrollDef.status,
    },
    employees: employeeSummary,
  };
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
// Get attendance by specific payroll definition
const getAttendanceByPayrollDefinition = async (query: {
  payrollDefinitionId: string;
  deviceUserId?: string;
  shiftId?: string;
  departmentId?: string;
  companyId?: string;
}) => {
  console.log("=== Getting Attendance by Payroll Definition ===");

  // Fetch the specific payroll definition
  const payrollDef = await prisma.payrollDefinition.findFirst({
    where: {
      id: query.payrollDefinitionId,
      companyId: query.companyId,
    },
  });

  if (!payrollDef) {
    throw new Error(
      `Payroll definition with ID ${query.payrollDefinitionId} not found for the company`
    );
  }

  console.log(`Using payroll definition: ${payrollDef.payrollName}`);
  console.log(`Date range: ${payrollDef.startDate} to ${payrollDef.endDate}`);

  // Get all employees for the company with department and position info
  const employees = await prisma.employee.findMany({
    where: {
      companyId: query.companyId,
      ...(query.deviceUserId && { deviceUserId: query.deviceUserId }),
      ...(query.departmentId && {
        departmentHistory: {
          some: {
            departmentId: query.departmentId,
            toDate: null, // Active department
          },
        },
      }),
    },
    include: {
      departmentHistory: {
        where: { toDate: null }, // Only active department
        include: {
          department: true,
        },
        take: 1,
      },
      positionHistory: {
        where: { toDate: null }, // Only active position
        include: {
          position: true,
        },
        take: 1,
      },
      employeeShifts: {
        where: { isActive: true },
        include: {
          shift: {
            select: {
              id: true,
              name: true,
              shiftType: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  // Generate all dates in the payroll period
  const dates: Date[] = [];
  const currentDate = new Date(payrollDef.startDate);
  const endDate = new Date(payrollDef.endDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get all work sessions for the payroll period
  const workSessions = await prisma.workSession.findMany({
    where: {
      deviceUserId: { in: employees.map(emp => emp.deviceUserId).filter((id): id is string => id !== null) },
      date: {
        gte: payrollDef.startDate,
        lte: payrollDef.endDate,
      },
    },
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
  });

  // Create a map of work sessions by employee and date
  const sessionMap = new Map();
  workSessions.forEach(session => {
    const key = `${session.deviceUserId}_${session.date.toISOString().split('T')[0]}`;
    sessionMap.set(key, session);
  });

  // Build the response structure
  const employeesData = employees.map(employee => {
    const attendanceInfo = dates.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const sessionKey = `${employee.deviceUserId}_${dateKey}`;
      const session = sessionMap.get(sessionKey);

      if (session) {
        // Calculate duration
        let durationMinutes = 0;
        let durationHours = 0;
        let durationFormatted = "";

        if (session.punchIn && session.punchOut) {
          const punchIn = new Date(session.punchIn);
          const punchOut = new Date(session.punchOut);
          durationMinutes = Math.round((punchOut.getTime() - punchIn.getTime()) / (1000 * 60));
          durationHours = +(durationMinutes / 60).toFixed(2);
          durationFormatted = formatDuration(durationMinutes);
        }

        return {
          date: date.toISOString(),
          punchIn: session.punchIn ? formatTime(session.punchIn) : "",
          punchOut: session.punchOut ? formatTime(session.punchOut) : "",
          punchInSource: session.punchInSource || "",
          punchOutSource: session.punchOutSource || "",
          durationMinutes: durationMinutes || "",
          durationHours: durationHours || "",
          durationFormatted: durationFormatted || "",
        };
      } else {
        // No attendance data for this date
        return {
          date: date.toISOString(),
          punchIn: "",
          punchOut: "",
          punchInSource: "",
          punchOutSource: "",
          durationMinutes: "",
          durationHours: "",
          durationFormatted: "",
        };
      }
    });

    return {
      employeeName: employee.name,
      departmentName: employee.departmentHistory[0]?.department?.deptName || "Unassigned",
      positionName: employee.positionHistory[0]?.position?.positionName || "Unassigned",
      phoneNumber: employee.phoneNumber || "",
      shiftType: employee.employeeShifts[0]?.shift?.shiftType || "Unassigned",
      employeeID: employee.id,
      attendanceInfo,
    };
  });

  return {
    payrollDefinition: {
      id: payrollDef.id,
      name: payrollDef.payrollName,
      startDate: payrollDef.startDate,
      endDate: payrollDef.endDate,
      payPeriod: payrollDef.payPeriod,
    },
    Employees: employeesData,
  };
};

// Get recent attendance (last 5 days from current month payroll)
const getRecentAttendance = async (query: {
  deviceUserId?: string;
  shiftId?: string;
  departmentId?: string;
  companyId?: string;
}) => {
  console.log("=== Getting Recent Attendance (Last 5 Days) ===");

  // Get current month's payroll definition
  const payrollDef = await prisma.payrollDefinition.findFirst({
    where: {
      companyId: query.companyId,
    },
    orderBy: { startDate: "desc" },
  });

  if (!payrollDef) {
    throw new Error("No payroll definition found for the company");
  }

  console.log(`Using payroll definition: ${payrollDef.payrollName}`);
  console.log(`Date range: ${payrollDef.startDate} to ${payrollDef.endDate}`);

  // Calculate the last 5 days from today
  const today = new Date();
  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 4); // 5 days including today

  // Get all employees for the company with department and position info
  const employees = await prisma.employee.findMany({
    where: {
      companyId: query.companyId,
      ...(query.deviceUserId && { deviceUserId: query.deviceUserId }),
      ...(query.departmentId && {
        departmentHistory: {
          some: {
            departmentId: query.departmentId,
            toDate: null, // Active department
          },
        },
      }),
    },
    include: {
      departmentHistory: {
        where: { toDate: null }, // Only active department
        include: {
          department: true,
        },
        take: 1,
      },
      positionHistory: {
        where: { toDate: null }, // Only active position
        include: {
          position: true,
        },
        take: 1,
      },
      employeeShifts: {
        where: { isActive: true },
        include: {
          shift: {
            select: {
              id: true,
              name: true,
              shiftType: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  // Generate last 5 days
  const dates: Date[] = [];
  const currentDate = new Date(fiveDaysAgo);
  
  for (let i = 0; i < 5; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get all work sessions for the last 5 days
  const workSessions = await prisma.workSession.findMany({
    where: {
      deviceUserId: { in: employees.map(emp => emp.deviceUserId).filter((id): id is string => id !== null) },
      date: {
        gte: fiveDaysAgo,
        lte: today,
      },
    },
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
  });

  // Create a map of work sessions by employee and date
  const sessionMap = new Map();
  workSessions.forEach(session => {
    const key = `${session.deviceUserId}_${session.date.toISOString().split('T')[0]}`;
    sessionMap.set(key, session);
  });

  // Build the response structure
  const employeesData = employees.map(employee => {
    const attendanceInfo = dates.map(date => {
      const dateKey = date.toISOString().split('T')[0];
      const sessionKey = `${employee.deviceUserId}_${dateKey}`;
      const session = sessionMap.get(sessionKey);

      if (session) {
        // Calculate duration
        let durationMinutes = 0;
        let durationHours = 0;
        let durationFormatted = "";

        if (session.punchIn && session.punchOut) {
          const punchIn = new Date(session.punchIn);
          const punchOut = new Date(session.punchOut);
          durationMinutes = Math.round((punchOut.getTime() - punchIn.getTime()) / (1000 * 60));
          durationHours = +(durationMinutes / 60).toFixed(2);
          durationFormatted = formatDuration(durationMinutes);
        }

        return {
          id: session.id|| "",
          date: date.toISOString(),
          punchIn: session.punchIn ? formatTime(session.punchIn) : "",
          punchOut: session.punchOut ? formatTime(session.punchOut) : "",
          punchInSource: session.punchInSource || "",
          punchOutSource: session.punchOutSource || "",
          durationMinutes: durationMinutes || "",
          durationHours: durationHours || "",
          durationFormatted: durationFormatted || "",
        };
      } else {
        // No attendance data for this date
        return {
          date: date.toISOString(),
          punchIn: "",
          punchOut: "",
          punchInSource: "",
          punchOutSource: "",
          durationMinutes: "",
          durationHours: "",
          durationFormatted: "",
        };
      }
    });

    return {
      employeeName: employee.name,
      departmentName: employee.departmentHistory[0]?.department?.deptName || "Unassigned",
      positionName: employee.positionHistory[0]?.position?.positionName || "Unassigned",
      phoneNumber: employee.phoneNumber || "",
      shiftType: employee.employeeShifts[0]?.shift?.shiftType || "Unassigned",
      employeeID: employee.id,
      attendanceInfo,
    };
  });

  return {
    payrollDefinition: {
      id: payrollDef.id,
      name: payrollDef.payrollName,
      startDate: payrollDef.startDate,
      endDate: payrollDef.endDate,
      payPeriod: payrollDef.payPeriod,
    },
    Employees: employeesData,
  };
};

// Get employee attendance by current month payroll definition
const getEmployeeAttendanceByDateRange = async (query: {
  employeeId: string;
  companyId?: string;
}) => {
  console.log("=== Getting Employee Attendance by Current Month Payroll Definition ===");

  // Get current month's payroll definition
  const payrollDef = await prisma.payrollDefinition.findFirst({
    where: {
      companyId: query.companyId,
    },
    orderBy: { startDate: "desc" },
  });

  if (!payrollDef) {
    throw new Error("No payroll definition found for the company");
  }

  console.log(`Using payroll definition: ${payrollDef.payrollName}`);
  console.log(`Date range: ${payrollDef.startDate} to ${payrollDef.endDate}`);

  // Get employee details
  const employee = await prisma.employee.findFirst({
    where: {
      id: query.employeeId,
      companyId: query.companyId,
    },
    include: {
      departmentHistory: {
        where: { toDate: null }, // Only active department
        include: {
          department: true,
        },
        take: 1,
      },
      positionHistory: {
        where: { toDate: null }, // Only active position
        include: {
          position: true,
        },
        take: 1,
      },
      employeeShifts: {
        where: { isActive: true },
        include: {
          shift: {
            select: {
              id: true,
              name: true,
              shiftType: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  if (!employee) {
    throw new Error(`Employee with ID ${query.employeeId} not found for the company`);
  }

  console.log(`Getting attendance for employee: ${employee.name}`);
  console.log(`Date range: ${payrollDef.startDate} to ${payrollDef.endDate}`);

  // Generate all dates in the range
  const dates: Date[] = [];
  const currentDate = new Date(payrollDef.startDate);
  const endDate = new Date(payrollDef.endDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get all work sessions for the employee in the date range
  const workSessions = await prisma.workSession.findMany({
    where: {
      deviceUserId: employee.deviceUserId || "",
      date: {
        gte: payrollDef.startDate,
        lte: payrollDef.endDate,
      },
    },
    include: {
      shift: {
        select: {
          id: true,
          name: true,
          shiftType: true,
        },
      },
      OvertimeTable: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Create a map of work sessions by date
  const sessionMap = new Map();
  workSessions.forEach(session => {
    const dateKey = session.date.toISOString().split('T')[0];
    sessionMap.set(dateKey, session);
  });

  // Build the attendance info for each date
  const attendanceInfo = dates.map(date => {
    const dateKey = date.toISOString().split('T')[0];
    const session = sessionMap.get(dateKey);

    if (session) {
      // Calculate duration
      let durationMinutes = 0;
      let durationHours = 0;
      let durationFormatted = "";

      if (session.punchIn && session.punchOut) {
        const punchIn = new Date(session.punchIn);
        const punchOut = new Date(session.punchOut);
        durationMinutes = Math.round((punchOut.getTime() - punchIn.getTime()) / (1000 * 60));
        durationHours = +(durationMinutes / 60).toFixed(2);
        durationFormatted = formatDuration(durationMinutes);
      }

      return {
        id: session.id || "",
        date: date.toISOString(),
        punchIn: session.punchIn ? formatTime(session.punchIn) : "",
        punchOut: session.punchOut ? formatTime(session.punchOut) : "",
        punchInSource: session.punchInSource || "",
        punchOutSource: session.punchOutSource || "",
        durationMinutes: durationMinutes || "",
        durationHours: durationHours || "",
        durationFormatted: durationFormatted || "",
      };
    } else {
      // No attendance data for this date
      return {
        id: "",
        date: date.toISOString(),
        punchIn: "",
        punchOut: "",
        punchInSource: "",
        punchOutSource: "",
        durationMinutes: "",
        durationHours: "",
        durationFormatted: "",
      };
    }
  });

  return {
    employee: {
      id: employee.id,
      name: employee.name,
      deviceUserId: employee.deviceUserId,
      phoneNumber: employee.phoneNumber || "",
      departmentName: employee.departmentHistory[0]?.department?.deptName || "Unassigned",
      positionName: employee.positionHistory[0]?.position?.positionName || "Unassigned",
      shiftType: employee.employeeShifts[0]?.shift?.shiftType || "Unassigned",
    },
    payrollDefinition: {
      id: payrollDef.id,
      name: payrollDef.payrollName,
      startDate: payrollDef.startDate,
      endDate: payrollDef.endDate,
      payPeriod: payrollDef.payPeriod,
    },
    attendanceInfo,
  };
};

// Get employee attendance by payroll definition ID
const getEmployeeAttendanceByPayrollDefinition = async (query: {
  employeeId: string;
  payrollDefinitionId: string;
  companyId?: string;
}) => {
  console.log("=== Enhanced Attendance Service: Employee Attendance by Payroll Definition ===");
  console.log("Employee ID:", query.employeeId);
  console.log("Payroll Definition ID:", query.payrollDefinitionId);
  console.log("Company ID:", query.companyId);

  // Get the specific payroll definition
  const payrollDef = await prisma.payrollDefinition.findUnique({
    where: {
      id: query.payrollDefinitionId,
      companyId: query.companyId,
    },
  });

  if (!payrollDef) {
    throw new ApiError(httpStatus.NOT_FOUND, "Payroll definition not found");
  }

  console.log("Found payroll definition:", payrollDef.payrollName);
  console.log("Date range:", payrollDef.startDate, "to", payrollDef.endDate);

  // Get employee details
  const employee = await prisma.employee.findUnique({
    where: {
      id: query.employeeId,
      companyId: query.companyId,
    },
    include: {
      departmentHistory: {
        where: { toDate: null },
        include: {
          department: true,
        },
        take: 1,
      },
      positionHistory: {
        where: { toDate: null },
        include: {
          position: true,
        },
        take: 1,
      },
    },
  });

  if (!employee) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee not found");
  }

  // Generate all dates in the payroll period
  const dates: Date[] = [];
  const currentDate = new Date(payrollDef.startDate);
  const endDate = new Date(payrollDef.endDate);

  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get work sessions for this employee in the payroll period
  const workSessions = await prisma.workSession.findMany({
    where: {
      deviceUserId: employee.deviceUserId || "",
      date: {
        gte: payrollDef.startDate,
        lte: payrollDef.endDate,
      },
    },
    include: {
      shift: true,
      OvertimeTable: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Create a map for quick lookup
  const sessionMap = new Map();
  workSessions.forEach((session) => {
    const dateKey = session.date.toISOString().split("T")[0];
    sessionMap.set(dateKey, session);
  });

  // Build attendance info for each date
  const attendanceInfo = dates.map((date) => {
    const dateKey = date.toISOString().split("T")[0];
    const session = sessionMap.get(dateKey);

    if (session) {
      // Calculate duration
      let durationMinutes = 0;
      let durationHours = 0;
      let durationFormatted = "";

      if (session.punchIn && session.punchOut) {
        const punchIn = new Date(session.punchIn);
        const punchOut = new Date(session.punchOut);
        durationMinutes = Math.round((punchOut.getTime() - punchIn.getTime()) / (1000 * 60));
        durationHours = +(durationMinutes / 60).toFixed(2);
        durationFormatted = formatDuration(durationMinutes);
      }

      return {
        id: session.id || "",
        date: date.toISOString(),
        punchIn: session.punchIn ? formatTime(session.punchIn) : "",
        punchOut: session.punchOut ? formatTime(session.punchOut) : "",
        punchInSource: session.punchInSource || "",
        punchOutSource: session.punchOutSource || "",
        durationMinutes: durationMinutes || "",
        durationHours: durationHours || "",
        durationFormatted: durationFormatted || "",
      };
    } else {
      // No attendance data for this date
      return {
        id: "",
        date: date.toISOString(),
        punchIn: "",
        punchOut: "",
        punchInSource: "",
        punchOutSource: "",
        durationMinutes: "",
        durationHours: "",
        durationFormatted: "",
      };
    }
  });

  return {
    employee: {
      id: employee.id,
      name: employee.name,
      username: employee.username,
      phoneNumber: employee.phoneNumber,
      deviceUserId: employee.deviceUserId,
      employeeIdNumber: employee.employeeIdNumber,
      gender: employee.gender,
      currentPosition: employee.positionHistory[0]?.position?.positionName || null,
      currentGrade: employee.positionHistory[0]?.position?.positionName || null,
      departmentName: employee.departmentHistory[0]?.department?.deptName || null,
    },
    payrollDefinition: {
      id: payrollDef.id,
      payrollName: payrollDef.payrollName,
      startDate: payrollDef.startDate,
      endDate: payrollDef.endDate,
      status: payrollDef.status,
    },
    attendanceInfo,
  };
};

// Get payroll definition summary by ID with department names
const getPayrollDefinitionSummaryById = async (query: {
  payrollDefinitionId: string;
  companyId?: string;
}) => {
  console.log("=== Getting Payroll Definition Summary by ID ===");

  // Get the specific payroll definition
  const payrollDef = await prisma.payrollDefinition.findFirst({
    where: {
      id: query.payrollDefinitionId,
      companyId: query.companyId,
    },
  });

  if (!payrollDef) {
    throw new Error(`Payroll definition with ID ${query.payrollDefinitionId} not found for the company`);
  }

  console.log(`Using payroll definition: ${payrollDef.payrollName}`);
  console.log(`Date range: ${payrollDef.startDate} to ${payrollDef.endDate}`);

  // Get all employees for the company with department and shift info
  const employees = await prisma.employee.findMany({
    where: {
      companyId: query.companyId,
    },
    include: {
      departmentHistory: {
        where: { toDate: null }, // Only active department
        include: {
          department: true,
        },
        take: 1,
      },
      employeeShifts: {
        where: { isActive: true },
        include: {
          shift: {
            select: {
              id: true,
              name: true,
              shiftType: true,
            },
          },
        },
        take: 1,
      },
    },
  });

  // Get all work sessions for the payroll period
  const workSessions = await prisma.workSession.findMany({
    where: {
      deviceUserId: { in: employees.map(emp => emp.deviceUserId).filter((id): id is string => id !== null) },
      date: {
        gte: payrollDef.startDate,
        lte: payrollDef.endDate,
      },
    },
    include: {
      OvertimeTable: true,
    },
  });

  // Calculate summary for each employee
  const employeesSummary = employees.map(employee => {
    const employeeSessions = workSessions.filter(session => session.deviceUserId === employee.deviceUserId);
    
    let totalWorkingHours = 0;
    let overtimeHours = 0;
    let deductibleHours = 0;

    employeeSessions.forEach(session => {
      if (session.punchIn && session.punchOut) {
        const durationMinutes = Math.round((new Date(session.punchOut).getTime() - new Date(session.punchIn).getTime()) / (1000 * 60));
        totalWorkingHours += durationMinutes / 60;
      }

      // Calculate overtime
      session.OvertimeTable.forEach(overtime => {
        if (overtime.punchIn && overtime.punchOut) {
          const overtimeMinutes = Math.round((new Date(overtime.punchOut).getTime() - new Date(overtime.punchIn).getTime()) / (1000 * 60));
          overtimeHours += overtimeMinutes / 60;
        }
      });
    });

    const netHoursWorked = totalWorkingHours + overtimeHours - deductibleHours;

    return {
      id: employee.id,
      name: employee.name,
      departmentName: employee.departmentHistory[0]?.department?.deptName || "Unassigned",
      shiftType: employee.employeeShifts[0]?.shift?.shiftType || "Unassigned",
      totalWorkingHours: +(totalWorkingHours).toFixed(2),
      overtimeHours: +(overtimeHours).toFixed(2),
      deductibleHours: +(deductibleHours).toFixed(2),
      netHoursWorked: +(netHoursWorked).toFixed(2),
    };
  });

  return {
    payrollDefinition: {
      id: payrollDef.id,
      payrollName: payrollDef.payrollName,
      startDate: payrollDef.startDate,
      endDate: payrollDef.endDate,
      status: payrollDef.status,
    },
    employees: employeesSummary,
  };
};

const enhancedAttendanceService = {
  getAttendanceByDateRange,
  getTodaysAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getYearlyAttendance,
  getAttendanceByDate,
  getAttendanceSummary,
  getPayrollDefinitionSummary,
  getAttendanceByPayrollDefinition,
  getRecentAttendance,
  getEmployeeAttendanceByDateRange,
  getEmployeeAttendanceByPayrollDefinition,
  getPayrollDefinitionSummaryById,
};

export default enhancedAttendanceService;
