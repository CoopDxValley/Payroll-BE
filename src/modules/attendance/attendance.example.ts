// // Example usage of attendance module with ZKTeck SpeedH5 device data

// import attendanceService from "./attendance.service";

// // Example 1: Process raw device data text
// export const processRawDeviceData = async () => {
//   const deviceDataText = `
// Today's attendance records:
// <Attendance>: 240163 : 2025-07-25 06:54:21 (15, 0)
// <Attendance>: 240089 : 2025-07-25 07:05:49 (15, 0)
// <Attendance>: 210634 : 2025-07-25 07:13:11 (15, 0)
// <Attendance>: 200175 : 2025-07-25 07:13:16 (15, 0)
// <Attendance>: 210667 : 2025-07-25 07:13:22 (15, 0)
// <Attendance>: 230997 : 2025-07-25 07:14:27 (15, 0)
// <Attendance>: 150340 : 2025-07-25 07:15:06 (15, 0)
// <Attendance>: 220185 : 2025-07-25 07:15:19 (15, 0)
// <Attendance>: 200675 : 2025-07-25 07:15:24 (15, 0)
// <Attendance>: 232173 : 2025-07-25 07:15:30 (15, 0)
//   `;

//   // Parse the device data
//   const parsedRecords = attendanceService.parseDeviceDataText(deviceDataText);
//   console.log("Parsed Records:", parsedRecords);

//   // Process the records
//   const result = await attendanceService.processDeviceData(parsedRecords);
//   console.log("Processing Result:", result);

//   return result;
// };

// // // Example 2: Manual attendance creation
// // export const createManualAttendance = async (employeeId: string) => {
// //   const attendance = await attendanceService.createAttendance({
// //     employeeId,
// //     checkTime: new Date(),
// //     checkType: 'IN',
// //     verifyMode: 1,
// //     workCode: 0,
// //   });

// //   console.log('Manual Attendance Created:', attendance);
// //   return attendance;
// // };

// // Example 3: Get employee daily summary
// export const getEmployeeSummary = async (employeeId: string, date: string) => {
//   const summary = await attendanceService.getEmployeeDailySummary(
//     employeeId,
//     date
//   );
//   console.log("Daily Summary:", summary);
//   return summary;
// };

// // Example 4: Bulk create attendance
// export const bulkCreateExample = async (employeeId: string) => {
//   const records = [
//     {
//       date: "2025-01-20T00:00:00.000Z",
//       checkTime: "2025-01-20T08:00:00.000Z",
//       checkType: "IN" as const,
//       verifyMode: 15,
//       workCode: 0,
//     },
//     {
//       date: "2025-01-20T00:00:00.000Z",
//       checkTime: "2025-01-20T17:00:00.000Z",
//       checkType: "OUT" as const,
//       verifyMode: 15,
//       workCode: 0,
//     },
//   ];

//   // const result = await attendanceService.bulkCreateAttendance(employeeId, records);
//   // console.log('Bulk Create Result:', result);
//   // return result;
// };

// // Example API Usage (for frontend integration):
// export const apiExamples = {
//   // 1. Process device data text via API
//   processDeviceText: {
//     method: "POST",
//     url: "/api/attendance/device/process-text",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer <token>",
//     },
//     body: {
//       deviceDataText: `<Attendance>: 220692 : 2025-07-25 07:17:57 (15, 0)`,
//     },
//   },

//   // 2. Process structured device data via API
//   processDeviceData: {
//     method: "POST",
//     url: "/api/attendance/device/process",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer <token>",
//     },
//     body: {
//       attendanceRecords: [
//         {
//           deviceUserId: "220692",
//           checkTime: "2025-07-25T07:17:57.000Z",
//           verifyMode: 15,
//           workCode: 0,
//         },
//       ],
//     },
//   },

//   // 3. Manual attendance creation
//   createAttendance: {
//     method: "POST",
//     url: "/api/attendance",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer <token>",
//     },
//     body: {
//       checkTime: "2025-01-20T08:00:00.000Z",
//       checkType: "IN",
//       verifyMode: 1,
//       workCode: 0,
//     },
//   },

//   // 4. Get attendance by date
//   getByDate: {
//     method: "GET",
//     url: "/api/attendance/date?date=2025-01-20&employeeId=<uuid>",
//     headers: {
//       Authorization: "Bearer <token>",
//     },
//   },

//   // 5. Get attendance range
//   getByRange: {
//     method: "GET",
//     url: "/api/attendance/range?startDate=2025-01-01&endDate=2025-01-31&employeeId=<uuid>",
//     headers: {
//       Authorization: "Bearer <token>",
//     },
//   },

//   // 6. Get daily summary
//   getDailySummary: {
//     method: "GET",
//     url: "/api/attendance/summary?date=2025-01-20&employeeId=<uuid>",
//     headers: {
//       Authorization: "Bearer <token>",
//     },
//   },
// };

// // Example: Setting up employee device mapping
// export const setupEmployeeDeviceMapping = async () => {
//   // This would typically be done through an admin interface
//   // Update employee with their device user ID

//   const employeeUpdates = [
//     { employeeId: "uuid-1", deviceUserId: "240163" },
//     { employeeId: "uuid-2", deviceUserId: "240089" },
//     { employeeId: "uuid-3", deviceUserId: "220692" },
//     // ... more mappings
//   ];

//   // Note: You would need to create an endpoint or service method
//   // to update employee records with deviceUserId
//   console.log("Employee device mappings:", employeeUpdates);
// };

// export default {
//   processRawDeviceData,
//   // createManualAttendance,
//   getEmployeeSummary,
//   bulkCreateExample,
//   apiExamples,
//   setupEmployeeDeviceMapping,
// };
