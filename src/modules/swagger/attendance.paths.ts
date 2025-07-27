/**
 * @swagger
 * paths:
 *   /api/attendance:
 *     post:
 *       tags: [Attendance]
 *       summary: Create manual attendance record
 *       description: Create a manual attendance record for the authenticated employee
 *       security:
 *         - BearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                   format: date-time
 *                   description: Optional date (defaults to checkTime date)
 *                 checkTime:
 *                   type: string
 *                   format: date-time
 *                   description: Check-in/out timestamp
 *                 checkType:
 *                   type: string
 *                   enum: [IN, OUT]
 *                   description: Type of check (auto-determined if not provided)
 *                 verifyMode:
 *                   type: integer
 *                   description: Verification mode
 *                 workCode:
 *                   type: integer
 *                   description: Work code
 *                 sensorId:
 *                   type: string
 *                   description: Sensor ID
 *                 deviceIp:
 *                   type: string
 *                   description: Device IP
 *                 deviceUserId:
 *                   type: string
 *                   description: Device user ID
 *                 isAbsent:
 *                   type: boolean
 *                   default: false
 *               required:
 *                 - checkTime
 *             example:
 *               checkTime: "2025-01-20T08:00:00.000Z"
 *               checkType: "IN"
 *               verifyMode: 1
 *               workCode: 0
 *       responses:
 *         201:
 *           description: Attendance logged successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/AttendanceResponse'
 *         400:
 *           description: Bad request - Invalid input
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         401:
 *           description: Unauthorized
 *         404:
 *           description: Employee not found
 * 
 *     get:
 *       tags: [Attendance]
 *       summary: Get attendance logs
 *       description: Get all attendance logs for the authenticated employee or specified employee
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: query
 *           name: employeeId
 *           schema:
 *             type: string
 *             format: uuid
 *           description: Employee ID (optional, defaults to authenticated user)
 *       responses:
 *         200:
 *           description: Attendance logs retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     type: array
 *                     items:
 *                       $ref: '#/components/schemas/Attendance'
 *                   count:
 *                     type: integer
 *         401:
 *           description: Unauthorized
 * 
 *   /api/attendance/device/process:
 *     post:
 *       tags: [Attendance - Device Integration]
 *       summary: Process structured device data
 *       description: Process structured attendance data from ZKTeck SpeedH5 device
 *       security:
 *         - BearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessDeviceDataRequest'
 *             example:
 *               attendanceRecords:
 *                 - deviceUserId: "220692"
 *                   checkTime: "2025-07-25T07:17:57.000Z"
 *                   verifyMode: 15
 *                   workCode: 0
 *                 - deviceUserId: "240163"
 *                   checkTime: "2025-07-25T06:54:21.000Z"
 *                   verifyMode: 15
 *                   workCode: 0
 *       responses:
 *         200:
 *           description: Device data processed successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ProcessingResponse'
 *         400:
 *           description: Bad request - Invalid data format
 *         401:
 *           description: Unauthorized
 * 
 *   /api/attendance/device/process-text:
 *     post:
 *       tags: [Attendance - Device Integration]
 *       summary: Process raw device data text
 *       description: Process raw text data from ZKTeck SpeedH5 device output
 *       security:
 *         - BearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessDeviceDataTextRequest'
 *             example:
 *               deviceDataText: |
 *                 Today's attendance records:
 *                 <Attendance>: 240163 : 2025-07-25 06:54:21 (15, 0)
 *                 <Attendance>: 240089 : 2025-07-25 07:05:49 (15, 0)
 *                 <Attendance>: 220692 : 2025-07-25 07:17:57 (15, 0)
 *       responses:
 *         200:
 *           description: Device data text processed successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     type: object
 *                     properties:
 *                       totalRecords:
 *                         type: integer
 *                         description: Total records parsed from text
 *                       successful:
 *                         type: integer
 *                         description: Successfully processed records
 *                       failed:
 *                         type: integer
 *                         description: Failed records
 *                       results:
 *                         type: array
 *                         items:
 *                           $ref: '#/components/schemas/Attendance'
 *                       errors:
 *                         type: array
 *                         items:
 *                           type: object
 *         400:
 *           description: Bad request - Invalid text format or no valid records found
 *         401:
 *           description: Unauthorized
 * 
 *   /api/attendance/bulk:
 *     post:
 *       tags: [Attendance - Bulk Operations]
 *       summary: Bulk create attendance records
 *       description: Create multiple attendance records for a specific employee
 *       security:
 *         - BearerAuth: []
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BulkAttendanceRequest'
 *             example:
 *               employeeId: "123e4567-e89b-12d3-a456-426614174000"
 *               records:
 *                 - date: "2025-01-20T00:00:00.000Z"
 *                   checkTime: "2025-01-20T08:00:00.000Z"
 *                   checkType: "IN"
 *                   verifyMode: 15
 *                   workCode: 0
 *                 - date: "2025-01-20T00:00:00.000Z"
 *                   checkTime: "2025-01-20T17:00:00.000Z"
 *                   checkType: "OUT"
 *                   verifyMode: 15
 *                   workCode: 0
 *       responses:
 *         200:
 *           description: Bulk attendance creation completed
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ProcessingResponse'
 *         400:
 *           description: Bad request
 *         401:
 *           description: Unauthorized
 * 
 *   /api/attendance/date:
 *     get:
 *       tags: [Attendance - Queries]
 *       summary: Get attendance by date
 *       description: Get attendance records for a specific date
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: query
 *           name: date
 *           required: true
 *           schema:
 *             type: string
 *             pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *           description: Date in YYYY-MM-DD format
 *           example: "2025-01-20"
 *         - in: query
 *           name: employeeId
 *           schema:
 *             type: string
 *             format: uuid
 *           description: Employee ID (optional, defaults to authenticated user)
 *       responses:
 *         200:
 *           description: Attendance records retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/AttendanceResponse'
 *         400:
 *           description: Bad request - Invalid date format
 *         401:
 *           description: Unauthorized
 * 
 *   /api/attendance/range:
 *     get:
 *       tags: [Attendance - Queries]
 *       summary: Get attendance by date range
 *       description: Get attendance records for a date range
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: query
 *           name: startDate
 *           required: true
 *           schema:
 *             type: string
 *             pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *           description: Start date in YYYY-MM-DD format
 *           example: "2025-01-01"
 *         - in: query
 *           name: endDate
 *           required: true
 *           schema:
 *             type: string
 *             pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *           description: End date in YYYY-MM-DD format
 *           example: "2025-01-31"
 *         - in: query
 *           name: employeeId
 *           schema:
 *             type: string
 *             format: uuid
 *           description: Employee ID (optional)
 *       responses:
 *         200:
 *           description: Attendance records retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/AttendanceResponse'
 *         400:
 *           description: Bad request - Invalid date format
 *         401:
 *           description: Unauthorized
 * 
 *   /api/attendance/summary:
 *     get:
 *       tags: [Attendance - Queries]
 *       summary: Get daily attendance summary
 *       description: Get a summary of attendance for a specific date including total hours worked
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: query
 *           name: date
 *           required: true
 *           schema:
 *             type: string
 *             pattern: '^\\d{4}-\\d{2}-\\d{2}$'
 *           description: Date in YYYY-MM-DD format
 *           example: "2025-01-20"
 *         - in: query
 *           name: employeeId
 *           schema:
 *             type: string
 *             format: uuid
 *           description: Employee ID (optional, defaults to authenticated user)
 *       responses:
 *         200:
 *           description: Daily attendance summary retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     $ref: '#/components/schemas/AttendanceSummary'
 *         400:
 *           description: Bad request - Invalid date format
 *         401:
 *           description: Unauthorized
 * 
 *   /api/attendance/{id}:
 *     get:
 *       tags: [Attendance]
 *       summary: Get attendance by ID
 *       description: Get a specific attendance record by its ID
 *       security:
 *         - BearerAuth: []
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: string
 *             format: uuid
 *           description: Attendance record ID
 *       responses:
 *         200:
 *           description: Attendance record retrieved successfully
 *           content:
 *             application/json:
 *               schema:
 *                 type: object
 *                 properties:
 *                   message:
 *                     type: string
 *                   data:
 *                     $ref: '#/components/schemas/Attendance'
 *         404:
 *           description: Attendance record not found
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/ErrorResponse'
 *         401:
 *           description: Unauthorized
 */

export const attendanceSwaggerPaths = {
  // This file contains all the API path definitions above
  // They will be automatically picked up by swagger-jsdoc
}; 