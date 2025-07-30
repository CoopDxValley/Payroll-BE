// import prisma from "../../client";
// import httpStatus from "http-status";
// import ApiError from "../../utils/api-error";

// interface CreateAttendanceData {
//   employeeIdNumber: string; // required
//   checkTime: Date | string; // required - the full timestamp
//   date?: Date | string; // optional - derived from checkTime if missing
//   checkType?: "PUNCHIN" | "PUNCHOUT"; // optional - determined if missing
//   verifyMode?: number;
//   workCode?: number;
//   sensorId?: string;
//   deviceIp?: string;
//   isAbsent?: boolean;
// }

// interface DeviceAttendanceRecord {
//   user_id: string;
//   timestamp: string;
//   status?: number;
//   punch?: number;
//   uid?: string;
//   device_ip?: string;
// }

// const createAttendance = async (data: CreateAttendanceData) => {
//   const {
//     employeeIdNumber,
//     date,
//     checkTime,
//     checkType,
//     verifyMode,
//     workCode,
//     sensorId,
//     deviceIp,
//     isAbsent = false,
//   } = data;

//   if (!employeeIdNumber || !checkTime) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Device user ID and check time are required"
//     );
//   }

//   const checkTimeDate = new Date(checkTime);

//   // Set `date` to just the YYYY-MM-DD part of `checkTime` if not provided
//   const dateOnly = date
//     ? new Date(date)
//     : new Date(checkTimeDate.toDateString()); // sets to start of the day

//   // Determine check type if not provided
//   let finalCheckType = checkType;
//   if (!finalCheckType && !isAbsent) {
//     const determinedCheckType = await determineCheckType(
//       employeeIdNumber,
//       checkTimeDate
//     );
//     if (determinedCheckType === null) {
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         "User already has both punch in and punch out for this date"
//       );
//     }
//     finalCheckType = determinedCheckType;
//   }

//   const attendanceData: any = {
//     employeeIdNumber,
//     date: dateOnly,
//     checkTime: checkTimeDate,
//     checkType: finalCheckType,
//     verifyMode,
//     workCode,
//     sensorId,
//     deviceIp,
//     isAbsent,
//   };

//   return await prisma.attendance.create({
//     data: attendanceData,
//   });
// };
// const determineCheckType = async (
//   employeeIdNumber: string,
//   checkTime: Date
// ): Promise<"PUNCHIN" | "PUNCHOUT" | null> => {
//   const dateOnly = new Date(checkTime.toDateString()); // gets YYYY-MM-DD

//   // Get today's attendance records for this device user
//   const todayRecords = await prisma.attendance.findMany({
//     where: {
//       employeeIdNumber,
//       date: dateOnly,
//       isAbsent: false,
//     },
//     orderBy: {
//       checkTime: "asc",
//     },
//   });

//   // Check existing punch types for the day
//   const hasPunchIn = todayRecords.some(
//     (record) => record.checkType === "PUNCHIN"
//   );
//   const hasPunchOut = todayRecords.some(
//     (record) => record.checkType === "PUNCHOUT"
//   );

//   // If no records exist, first punch is PUNCHIN
//   if (todayRecords.length === 0) {
//     return "PUNCHIN";
//   }

//   // If has PUNCHIN but no PUNCHOUT, next should be PUNCHOUT
//   if (hasPunchIn && !hasPunchOut) {
//     return "PUNCHOUT";
//   }

//   // If no PUNCHIN yet (only PUNCHOUT exists somehow), next should be PUNCHIN
//   if (!hasPunchIn && hasPunchOut) {
//     return "PUNCHIN";
//   }

//   // If both PUNCHIN and PUNCHOUT already exist, return null (skip this record)
//   if (hasPunchIn && hasPunchOut) {
//     return null;
//   }

//   // Default fallback (shouldn't reach here)
//   return "PUNCHIN";
// };

// const getAllAttendanceLogs = async () => {
//   const today = new Date();
//   const startOfDay = new Date(today.toDateString()); // 00:00:00
//   const endOfDay = new Date(today.toDateString());
//   endOfDay.setHours(23, 59, 59, 999); // 23:59:59.999

//   const logs = await prisma.attendance.findMany({
//     where: {
//       checkTime: {
//         gte: startOfDay,
//         lte: endOfDay,
//       },
//     },
//     orderBy: [{ checkTime: "desc" }],
//   });

//   return await attachEmployeesToAttendance(logs);
// };

// const attachEmployeesToAttendance = async (logs: any[]) => {
//   // Get unique employeeIdNumbers from the logs
//   const employeeIdNumbers = [...new Set(logs.map((log) => log.employeeIdNumber))];

//   // Find all matching employees by employeeIdNumber
//   const employees = await prisma.employee.findMany({
//     where: { employeeIdNumber: { in: employeeIdNumbers } },
//     select: {
//       id: true,
//       name: true,
//       username: true,
//       employeeIdNumber: true,
//     },
//   });

//   // Create a map for quick lookup
//   const employeeMap = new Map(employees.map((emp) => [emp.employeeIdNumber, emp]));

//   // Attach employee info to each log
//   return logs.map((log) => ({
//     ...log,
//     employee: employeeMap.get(log.employeeIdNumber) || null,
//   }));
// };

// const getAttendanceById = async (id: string) => {
//   return prisma.attendance.findUnique({
//     where: { id },
//     // include: { employee: true },
//   });
// };

// const bulkDeviceRegistration = async (records: DeviceAttendanceRecord[]) => {
//   if (!records || records.length === 0) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "No records provided");
//   }

//   const processedRecords = [];
//   const errors = [];
//   let skippedComplete = 0; // Users who already have both punch in and out

//   // Process records in order to maintain correct punch in/out sequence
//   for (const record of records) {
//     try {
//       const checkTimeDate = new Date(record.timestamp);

//       if (isNaN(checkTimeDate.getTime())) {
//         errors.push(
//           `Invalid timestamp for user ${record.user_id}: ${record.timestamp}`
//         );
//         continue;
//       }

//       const dateOnly = new Date(checkTimeDate.toDateString());

//       // Check if this exact record already exists (prevent duplicates)
//       const existingRecord = await prisma.attendance.findFirst({
//         where: {
//           employeeIdNumber: record.user_id,
//           checkTime: checkTimeDate,
//           date: dateOnly,
//         },
//       });

//       if (existingRecord) {
//         // Skip duplicate records
//         continue;
//       }

//       // Determine check type automatically
//       const checkType = await determineCheckType(record.user_id, checkTimeDate);

//       // Skip record if user already has both PUNCHIN and PUNCHOUT for the day
//       if (checkType === null) {
//         skippedComplete++;
//         continue;
//       }

//       const attendanceData = {
//         employeeIdNumber: record.user_id,
//         date: dateOnly,
//         checkTime: checkTimeDate,
//         checkType: checkType,
//         verifyMode: record.status, // Map device status to verifyMode
//         workCode: record.punch, // Map device punch to workCode
//         sensorId: record.uid, // Map device UID to sensorId
//         deviceIp: record.device_ip,
//         isAbsent: false,
//       };

//       const createdRecord = await prisma.attendance.create({
//         data: attendanceData,
//       });

//       processedRecords.push(createdRecord);
//     } catch (error) {
//       errors.push(
//         `Error processing record for user ${record.user_id}: ${
//           error instanceof Error ? error.message : "Unknown error"
//         }`
//       );
//     }
//   }

//   return {
//     success: true,
//     totalRecords: records.length,
//     processedRecords: processedRecords.length,
//     skippedDuplicates:
//       records.length -
//       processedRecords.length -
//       errors.length -
//       skippedComplete,
//     skippedComplete: skippedComplete, // Users who already had both punch in and out
//     errors: errors.length > 0 ? errors : undefined,
//     data: processedRecords,
//   };
// };

// const getAttendanceByDateRange = async (
//   startDate: string,
//   endDate: string,
//   employeeId?: string
// ) => {
//   const startDateObj = new Date(startDate + "T00:00:00.000Z");
//   const endDateObj = new Date(endDate + "T23:59:59.999Z");

//   const whereCondition: any = {
//     date: {
//       gte: startDateObj,
//       lte: endDateObj,
//     },
//   };

//   // If employeeId is provided, we need to find the employeeIdNumber first
//   if (employeeId) {
//     const employee = await prisma.employee.findUnique({
//       where: { id: employeeId },
//       select: { employeeIdNumber: true },
//     });

//     if (!employee || !employee.employeeIdNumber) {
//       throw new ApiError(
//         httpStatus.NOT_FOUND,
//         "Employee not found or doesn't have a device user ID"
//       );
//     }

//     whereCondition.employeeIdNumber = employee.employeeIdNumber;
//   }

//   const logs = await prisma.attendance.findMany({
//     where: whereCondition,
//     orderBy: [{ date: "desc" }, { checkTime: "desc" }],
//   });

//   return await attachEmployeesToAttendance(logs);
// };

// const getAttendanceByDate = async (date: string, employeeId?: string) => {
//   const dateObj = new Date(date + "T00:00:00.000Z");
//   const endOfDay = new Date(date + "T23:59:59.999Z");

//   const whereCondition: any = {
//     date: {
//       gte: dateObj,
//       lte: endOfDay,
//     },
//   };

//   // If employeeId is provided, we need to find the employeeIdNumber first
//   if (employeeId) {
//     const employee = await prisma.employee.findUnique({
//       where: { id: employeeId },
//       select: { employeeIdNumber: true },
//     });

//     if (!employee || !employee.employeeIdNumber) {
//       throw new ApiError(
//         httpStatus.NOT_FOUND,
//         "Employee not found or doesn't have a device user ID"
//       );
//     }

//     whereCondition.employeeIdNumber = employee.employeeIdNumber;
//   }

//   const logs = await prisma.attendance.findMany({
//     where: whereCondition,
//     orderBy: [{ checkTime: "asc" }],
//   });

//   return await attachEmployeesToAttendance(logs);
// };

// // const getAttendanceSummary = async (
// //   startDate: string,
// //   endDate: string,
// //   employeeId?: string
// // ) => {
// //   const startDateObj = new Date(startDate + "T00:00:00.000Z");
// //   const endDateObj = new Date(endDate + "T23:59:59.999Z");

// //   const whereCondition: any = {
// //     date: {
// //       gte: startDateObj,
// //       lte: endDateObj,
// //     },
// //   };

// //   // If employeeId is provided, filter by that employee
// //   if (employeeId) {
// //     const employee = await prisma.employee.findUnique({
// //       where: { id: employeeId },
// //       select: { employeeIdNumber: true },
// //     });

// //     if (!employee || !employee.employeeIdNumber) {
// //       throw new ApiError(
// //         httpStatus.NOT_FOUND,
// //         "Employee not found or doesn't have a device user ID"
// //       );
// //     }

// //     whereCondition.employeeIdNumber = employee.employeeIdNumber;
// //   }

// //   // Get all attendance records for the period
// //   const allRecords = await prisma.attendance.findMany({
// //     where: whereCondition,
// //     select: {
// //       employeeIdNumber: true,
// //       date: true,
// //       checkType: true,
// //       checkTime: true,
// //       isAbsent: true,
// //     },
// //     orderBy: [
// //       { date: "asc" },
// //       { checkTime: "asc" }
// //     ],
// //   });

// //   // Group by date and employeeIdNumber to analyze daily attendance
// //   const dailyAttendance = new Map();

// //   allRecords.forEach(record => {
// //     const dateKey = record.date.toISOString().split('T')[0];
// //     const userKey = record.employeeIdNumber;
// //     const combinedKey = `${dateKey}-${userKey}`;

// //     if (!dailyAttendance.has(combinedKey)) {
// //       dailyAttendance.set(combinedKey, {
// //         date: dateKey,
// //         employeeIdNumber: userKey,
// //         punchIn: null,
// //         punchOut: null,
// //         isAbsent: record.isAbsent,
// //         isComplete: false,
// //       });
// //     }

// //     const dayRecord = dailyAttendance.get(combinedKey);

// //     if (record.checkType === "PUNCHIN") {
// //       dayRecord.punchIn = record.checkTime;
// //     } else if (record.checkType === "PUNCHOUT") {
// //       dayRecord.punchOut = record.checkTime;
// //     }

// //     // Mark as complete if has both punch in and out
// //     dayRecord.isComplete = dayRecord.punchIn && dayRecord.punchOut;
// //   });

// //   const dailyRecords = Array.from(dailyAttendance.values());

// //   // Calculate statistics
// //   const totalDays = dailyRecords.length;
// //   const completeDays = dailyRecords.filter(day => day.isComplete).length;
// //   const incompleteDays = dailyRecords.filter(day => !day.isComplete && !day.isAbsent).length;
// //   const absentDays = dailyRecords.filter(day => day.isAbsent).length;
// //   const uniqueEmployees = new Set(allRecords.map(r => r.employeeIdNumber)).size;

// //   return {
// //     dateRange: {
// //       startDate,
// //       endDate,
// //     },
// //     summary: {
// //       totalRecords: allRecords.length,
// //       totalDays: totalDays,
// //       completeDays: completeDays,
// //       incompleteDays: incompleteDays,
// //       absentDays: absentDays,
// //       uniqueEmployees: uniqueEmployees,
// //       completionRate: totalDays > 0 ? ((completeDays / totalDays) * 100).toFixed(2) + '%' : '0%',
// //     },
// //     dailyBreakdown: dailyRecords,
// //   };
// // };

// // const getAttendanceSummary = async (
// //   startDate: string,
// //   endDate: string,
// //   employeeId?: string
// // ) => {
// //   const startDateObj = new Date(`${startDate}T00:00:00.000Z`);
// //   const endDateObj = new Date(`${endDate}T23:59:59.999Z`);

// //   const whereCondition: any = {
// //     date: {
// //       gte: startDateObj,
// //       lte: endDateObj,
// //     },
// //   };

// //   // If employeeId is provided, map to employeeIdNumber
// //   if (employeeId) {
// //     const employee = await prisma.employee.findUnique({
// //       where: { id: employeeId },
// //       select: { employeeIdNumber: true },
// //     });

// //     if (!employee || !employee.employeeIdNumber) {
// //       throw new ApiError(
// //         httpStatus.NOT_FOUND,
// //         "Employee not found or doesn't have a device user ID"
// //       );
// //     }

// //     whereCondition.employeeIdNumber = employee.employeeIdNumber;
// //   }

// //   // Fetch all attendance records in range
// //   const allRecords = await prisma.attendance.findMany({
// //     where: whereCondition,
// //     select: {
// //       employeeIdNumber: true,
// //       date: true,
// //       checkType: true,
// //       checkTime: true,
// //       isAbsent: true,
// //     },
// //     orderBy: [{ employeeIdNumber: "asc" }, { date: "asc" }, { checkTime: "asc" }],
// //   });

// //   // Group and summarize per day
// //   const summary: Record<string, any> = {};

// //   for (const record of allRecords) {
// //     const key = `${record.employeeIdNumber}_${
// //       record.date.toISOString().split("T")[0]
// //     }`;

// //     if (!summary[key]) {
// //       summary[key] = {
// //         employeeIdNumber: record.employeeIdNumber,
// //         date: record.date,
// //         checkIn: null,
// //         checkOut: null,
// //         totalHours: 0,
// //         isAbsent: false,
// //         records: [],
// //       };
// //     }

// //     summary[key].records.push(record);

// //     if (record.isAbsent) {
// //       summary[key].isAbsent = true;
// //     } else if (record.checkType === "PUNCHIN") {
// //       summary[key].checkIn ??= record.checkTime;
// //     } else if (record.checkType === "PUNCHOUT") {
// //       summary[key].checkOut = record.checkTime;
// //     }

// //     // Calculate totalHours if both checkIn and checkOut exist
// //     const { checkIn, checkOut } = summary[key];
// //     if (checkIn && checkOut) {
// //       summary[key].totalHours =
// //         (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
// //         (1000 * 60 * 60);
// //     }
// //   }

// //   // Return an array of daily summaries
// //   return Object.values(summary);
// // };
// const getAttendanceSummary = async (
//   startDate: string,
//   endDate: string,
//   employeeId?: string
// ) => {
//   const startDateObj = new Date(`${startDate}T00:00:00.000Z`);
//   const endDateObj = new Date(`${endDate}T23:59:59.999Z`);

//   const whereCondition: any = {
//     date: {
//       gte: startDateObj,
//       lte: endDateObj,
//     },
//   };

//   let employeeIdNumberMap: Record<string, { id: string; name: string }> = {};

//   // If employeeId is provided, map to employeeIdNumber
//   if (employeeId) {
//     const employee = await prisma.employee.findUnique({
//       where: { id: employeeId },
//       select: { employeeIdNumber: true, id: true, name: true },
//     });

//     if (!employee || !employee.employeeIdNumber) {
//       throw new ApiError(
//         httpStatus.NOT_FOUND,
//         "Employee not found or doesn't have a device user ID"
//       );
//     }

//     whereCondition.employeeIdNumber = employee.employeeIdNumber;
//     employeeIdNumberMap[employee.employeeIdNumber] = {
//       id: employee.id,
//       name: employee.name,
//     };
//   } else {
//     // Preload all employeeIdNumber mappings for the entire company
//     const employees = await prisma.employee.findMany({
//       select: { employeeIdNumber: true, id: true, name: true },
//       where: { employeeIdNumber: { not: null } },
//     });

//     for (const emp of employees) {
//       if (emp.employeeIdNumber) {
//         employeeIdNumberMap[emp.employeeIdNumber] = {
//           id: emp.id,
//           name: emp.name,
//         };
//       }
//     }
//   }

//   const allRecords = await prisma.attendance.findMany({
//     where: whereCondition,
//     select: {
//       employeeIdNumber: true,
//       date: true,
//       checkType: true,
//       checkTime: true,
//       isAbsent: true,
//     },
//     orderBy: [{ employeeIdNumber: "asc" }, { date: "asc" }, { checkTime: "asc" }],
//   });

//   const summary: Record<string, any> = {};

//   for (const record of allRecords) {
//     const key = `${record.employeeIdNumber}_${
//       record.date.toISOString().split("T")[0]
//     }`;
//     const employee = employeeIdNumberMap[record.employeeIdNumber];

//     if (!summary[key]) {
//       summary[key] = {
//         employeeIdNumber: record.employeeIdNumber,
//         employeeId: employee?.id ?? null,
//         employeeName: employee?.name ?? null,
//         date: record.date,
//         checkIn: null,
//         checkOut: null,
//         totalHours: 0,
//         isAbsent: false,
//         records: [],
//       };
//     }

//     summary[key].records.push(record);

//     if (record.isAbsent) {
//       summary[key].isAbsent = true;
//     } else if (record.checkType === "PUNCHIN") {
//       summary[key].checkIn ??= record.checkTime;
//     } else if (record.checkType === "PUNCHOUT") {
//       summary[key].checkOut = record.checkTime;
//     }

//     const { checkIn, checkOut } = summary[key];
//     if (checkIn && checkOut) {
//       summary[key].totalHours =
//         (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
//         (1000 * 60 * 60);
//     }
//   }

//   return Object.values(summary);
// };

// const getTodaysAttendance = async () => {
//   const today = new Date();
//   const dateOnly = new Date(
//     today.toISOString().split("T")[0] + "T00:00:00.000Z"
//   );

//   // Preload all employees with employeeIdNumber
//   const employees = await prisma.employee.findMany({
//     select: {
//       id: true,
//       name: true,
//       employeeIdNumber: true,
//     },
//     where: {
//       employeeIdNumber: { not: null },
//     },
//   });

//   const employeeIdNumberMap: Record<string, { id: string; name: string }> = {};
//   for (const emp of employees) {
//     if (emp.employeeIdNumber) {
//       employeeIdNumberMap[emp.employeeIdNumber] = {
//         id: emp.id,
//         name: emp.name,
//       };
//     }
//   }

//   // Get today's attendance logs
//   const records = await prisma.attendance.findMany({
//     where: {
//       date: dateOnly,
//     },
//     select: {
//       employeeIdNumber: true,
//       checkType: true,
//       checkTime: true,
//       isAbsent: true,
//     },
//     orderBy: {
//       checkTime: "asc",
//     },
//   });

//   // Group by employeeIdNumber + summarize
//   const summary: Record<string, any> = {};

//   for (const record of records) {
//     const empInfo = employeeIdNumberMap[record.employeeIdNumber];
//     if (!empInfo) continue;

//     const key = record.employeeIdNumber;

//     if (!summary[key]) {
//       summary[key] = {
//         employeeId: empInfo.id,
//         employeeName: empInfo.name,
//         employeeIdNumber: record.employeeIdNumber,
//         date: dateOnly,
//         checkIn: null,
//         checkOut: null,
//         totalHours: 0,
//         isAbsent: false,
//         records: [],
//       };
//     }

//     summary[key].records.push(record);

//     if (record.isAbsent) {
//       summary[key].isAbsent = true;
//     } else if (record.checkType === "PUNCHIN") {
//       summary[key].checkIn ??= record.checkTime;
//     } else if (record.checkType === "PUNCHOUT") {
//       summary[key].checkOut = record.checkTime;
//     }

//     const { checkIn, checkOut } = summary[key];
//     if (checkIn && checkOut) {
//       summary[key].totalHours =
//         (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
//         (1000 * 60 * 60);
//     }
//   }

//   return Object.values(summary);
// };
// const getWeeklyAttendance = async () => {
//   // Get today's date in UTC
//   const today = new Date();

//   // Calculate current week's Monday (start of week)
//   const dayOfWeek = today.getUTCDay(); // Sunday=0, Monday=1, ..., Saturday=6
//   const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), treat as 7th day of previous week

//   // Monday at 00:00:00 UTC
//   const monday = new Date(
//     Date.UTC(
//       today.getUTCFullYear(),
//       today.getUTCMonth(),
//       today.getUTCDate() - diffToMonday,
//       0,
//       0,
//       0
//     )
//   );

//   // Sunday at 23:59:59.999 UTC
//   const sunday = new Date(
//     Date.UTC(
//       today.getUTCFullYear(),
//       today.getUTCMonth(),
//       today.getUTCDate() + (7 - diffToMonday) - 1,
//       23,
//       59,
//       59,
//       999
//     )
//   );

//   // Preload employees with employeeIdNumber
//   const employees = await prisma.employee.findMany({
//     select: {
//       id: true,
//       name: true,
//       employeeIdNumber: true,
//     },
//     where: {
//       employeeIdNumber: { not: null },
//     },
//   });

//   const employeeIdNumberMap: Record<string, { id: string; name: string }> = {};
//   for (const emp of employees) {
//     if (emp.employeeIdNumber) {
//       employeeIdNumberMap[emp.employeeIdNumber] = {
//         id: emp.id,
//         name: emp.name,
//       };
//     }
//   }

//   // Get attendance records in the current week
//   const records = await prisma.attendance.findMany({
//     where: {
//       date: {
//         gte: monday,
//         lte: sunday,
//       },
//     },
//     select: {
//       employeeIdNumber: true,
//       date: true,
//       checkType: true,
//       checkTime: true,
//       isAbsent: true,
//     },
//     orderBy: [{ employeeIdNumber: "asc" }, { date: "asc" }, { checkTime: "asc" }],
//   });

//   // Group by employeeIdNumber and date (daily summary per employee)
//   const summary: Record<string, any> = {};

//   for (const record of records) {
//     const empInfo = employeeIdNumberMap[record.employeeIdNumber];
//     if (!empInfo) continue;

//     // Key includes employeeIdNumber and date (yyyy-mm-dd)
//     const day = record.date.toISOString().split("T")[0];
//     const key = `${record.employeeIdNumber}_${day}`;

//     if (!summary[key]) {
//       summary[key] = {
//         employeeId: empInfo.id,
//         employeeName: empInfo.name,
//         employeeIdNumber: record.employeeIdNumber,
//         date: record.date,
//         checkIn: null,
//         checkOut: null,
//         totalHours: 0,
//         isAbsent: false,
//         records: [],
//       };
//     }

//     summary[key].records.push(record);

//     if (record.isAbsent) {
//       summary[key].isAbsent = true;
//     } else if (record.checkType === "PUNCHIN") {
//       summary[key].checkIn ??= record.checkTime;
//     } else if (record.checkType === "PUNCHOUT") {
//       summary[key].checkOut = record.checkTime;
//     }

//     const { checkIn, checkOut } = summary[key];
//     if (checkIn && checkOut) {
//       summary[key].totalHours =
//         (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
//         (1000 * 60 * 60);
//     }
//   }

//   // Return array of daily attendance summaries for the current week
//   return Object.values(summary);
// };
// const getMonthlyAttendance = async () => {
//   const today = new Date();

//   // First day of the current month at 00:00:00 UTC
//   const firstDay = new Date(
//     Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1, 0, 0, 0)
//   );

//   // Last day of the current month at 23:59:59.999 UTC
//   const lastDay = new Date(
//     Date.UTC(
//       today.getUTCFullYear(),
//       today.getUTCMonth() + 1,
//       0,
//       23,
//       59,
//       59,
//       999
//     )
//   );

//   // Preload employees with employeeIdNumber
//   const employees = await prisma.employee.findMany({
//     select: {
//       id: true,
//       name: true,
//       employeeIdNumber: true,
//     },
//     where: {
//       employeeIdNumber: { not: null },
//     },
//   });

//   const employeeIdNumberMap: Record<string, { id: string; name: string }> = {};
//   for (const emp of employees) {
//     if (emp.employeeIdNumber) {
//       employeeIdNumberMap[emp.employeeIdNumber] = {
//         id: emp.id,
//         name: emp.name,
//       };
//     }
//   }

//   // Get attendance records in the current month
//   const records = await prisma.attendance.findMany({
//     where: {
//       date: {
//         gte: firstDay,
//         lte: lastDay,
//       },
//     },
//     select: {
//       employeeIdNumber: true,
//       date: true,
//       checkType: true,
//       checkTime: true,
//       isAbsent: true,
//     },
//     orderBy: [{ employeeIdNumber: "asc" }, { date: "asc" }, { checkTime: "asc" }],
//   });

//   // Group by employeeIdNumber and date (daily summary per employee)
//   const summary: Record<string, any> = {};

//   for (const record of records) {
//     const empInfo = employeeIdNumberMap[record.employeeIdNumber];
//     if (!empInfo) continue;

//     const day = record.date.toISOString().split("T")[0];
//     const key = `${record.employeeIdNumber}_${day}`;

//     if (!summary[key]) {
//       summary[key] = {
//         employeeId: empInfo.id,
//         employeeName: empInfo.name,
//         employeeIdNumber: record.employeeIdNumber,
//         date: record.date,
//         checkIn: null,
//         checkOut: null,
//         totalHours: 0,
//         isAbsent: false,
//         records: [],
//       };
//     }

//     summary[key].records.push(record);

//     if (record.isAbsent) {
//       summary[key].isAbsent = true;
//     } else if (record.checkType === "PUNCHIN") {
//       summary[key].checkIn ??= record.checkTime;
//     } else if (record.checkType === "PUNCHOUT") {
//       summary[key].checkOut = record.checkTime;
//     }

//     const { checkIn, checkOut } = summary[key];
//     if (checkIn && checkOut) {
//       summary[key].totalHours =
//         (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
//         (1000 * 60 * 60);
//     }
//   }

//   return Object.values(summary);
// };
// const getYearlyAttendance = async () => {
//   const today = new Date();

//   // First day of the current year at 00:00:00 UTC
//   const firstDay = new Date(Date.UTC(today.getUTCFullYear(), 0, 1, 0, 0, 0));

//   // Last day of the current year at 23:59:59.999 UTC
//   const lastDay = new Date(
//     Date.UTC(today.getUTCFullYear(), 11, 31, 23, 59, 59, 999)
//   );

//   // Preload employees with employeeIdNumber
//   const employees = await prisma.employee.findMany({
//     select: {
//       id: true,
//       name: true,
//       employeeIdNumber: true,
//     },
//     where: {
//       employeeIdNumber: { not: null },
//     },
//   });

//   const employeeIdNumberMap: Record<string, { id: string; name: string }> = {};
//   for (const emp of employees) {
//     if (emp.employeeIdNumber) {
//       employeeIdNumberMap[emp.employeeIdNumber] = {
//         id: emp.id,
//         name: emp.name,
//       };
//     }
//   }

//   // Get attendance records in the current year
//   const records = await prisma.attendance.findMany({
//     where: {
//       date: {
//         gte: firstDay,
//         lte: lastDay,
//       },
//     },
//     select: {
//       employeeIdNumber: true,
//       date: true,
//       checkType: true,
//       checkTime: true,
//       isAbsent: true,
//     },
//     orderBy: [{ employeeIdNumber: "asc" }, { date: "asc" }, { checkTime: "asc" }],
//   });

//   // Group by employeeIdNumber and date (daily summary per employee)
//   const summary: Record<string, any> = {};

//   for (const record of records) {
//     const empInfo = employeeIdNumberMap[record.employeeIdNumber];
//     if (!empInfo) continue;

//     const day = record.date.toISOString().split("T")[0];
//     const key = `${record.employeeIdNumber}_${day}`;

//     if (!summary[key]) {
//       summary[key] = {
//         employeeId: empInfo.id,
//         employeeName: empInfo.name,
//         employeeIdNumber: record.employeeIdNumber,
//         date: record.date,
//         checkIn: null,
//         checkOut: null,
//         totalHours: 0,
//         isAbsent: false,
//         records: [],
//       };
//     }

//     summary[key].records.push(record);

//     if (record.isAbsent) {
//       summary[key].isAbsent = true;
//     } else if (record.checkType === "PUNCHIN") {
//       summary[key].checkIn ??= record.checkTime;
//     } else if (record.checkType === "PUNCHOUT") {
//       summary[key].checkOut = record.checkTime;
//     }

//     const { checkIn, checkOut } = summary[key];
//     if (checkIn && checkOut) {
//       summary[key].totalHours =
//         (new Date(checkOut).getTime() - new Date(checkIn).getTime()) /
//         (1000 * 60 * 60);
//     }
//   }

//   return Object.values(summary);
// };

// const updateAttendanceTimestamp = async (id: string, checkTime: string) => {
//   const attendance = await prisma.attendance.findUnique({ where: { id } });

//   if (!attendance) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Attendance record not found");
//   }

//   const newCheckTime = new Date(checkTime);
//   if (isNaN(newCheckTime.getTime())) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid checkTime format");
//   }

//   // If the new checkTime is same as the old one, no update needed
//   if (newCheckTime.getTime() === new Date(attendance.checkTime).getTime()) {
//     return attendance; // return existing without updating
//   }

//   // Update checkTime and keep date synced with checkTime's date
//   const updated = await prisma.attendance.update({
//     where: { id },
//     data: {
//       checkTime: newCheckTime,
//       date: new Date(newCheckTime.toDateString()),
//     },
//   });

//   return updated;
// };

// // const updateAttendanceTimestamp = async (id: string, checkTime: string) => {
// //   const attendance = await prisma.attendance.findUnique({ where: { id } });

// //   if (!attendance) {
// //     throw new ApiError(httpStatus.NOT_FOUND, "Attendance record not found");
// //   }

// //   const newCheckTime = new Date(checkTime);
// //   if (isNaN(newCheckTime.getTime())) {
// //     throw new ApiError(httpStatus.BAD_REQUEST, "Invalid checkTime format");
// //   }

// //   // Update checkTime (and optionally date to match checkTime's date)
// //   const updated = await prisma.attendance.update({
// //     where: { id },
// //     data: {
// //       checkTime: newCheckTime,
// //       date: new Date(newCheckTime.toDateString()), // keep date synced with checkTime's date
// //     },
// //   });

// //   return updated;
// // };

// export default {
//   createAttendance,
//   getAllAttendanceLogs,
//   getAttendanceById,
//   bulkDeviceRegistration,
//   getAttendanceByDateRange,
//   getAttendanceByDate,
//   getAttendanceSummary,
//   getTodaysAttendance,
//   getWeeklyAttendance,
//   getMonthlyAttendance,
//   getYearlyAttendance,
//   updateAttendanceTimestamp,
// };
