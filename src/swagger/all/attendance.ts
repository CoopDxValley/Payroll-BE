/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Manage attendance records and queries
 */

/**
 * @swagger
 * /api/v1/attendance:
 *   post:
 *     summary: Create a new attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttendance'
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance logged
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: Bad Request
 *   get:
 *     summary: Get all attendance logs
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of attendance logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 count:
 *                   type: number
 *                   example: 25
 */

/**
 * @swagger
 * /api/v1/attendance/bulk-device-registration:
 *   post:
 *     summary: Bulk device registration for attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkDeviceRegistration'
 *     responses:
 *       201:
 *         description: Bulk attendance registration completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Bulk attendance registration completed
 *                 successCount:
 *                   type: number
 *                   example: 50
 *                 errorCount:
 *                   type: number
 *                   example: 0
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/attendance/date-range:
 *   get:
 *     summary: Get attendance records in a specified date range
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Employee ID to filter by
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Attendance records in the date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 count:
 *                   type: number
 *                   example: 62
 *                 dateRange:
 *                   type: object
 *                   properties:
 *                     startDate:
 *                       type: string
 *                       example: "2024-01-01"
 *                     endDate:
 *                       type: string
 *                       example: "2024-01-31"
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/attendance/today:
 *   get:
 *     summary: Get today's attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for today
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 count:
 *                   type: number
 *                   example: 25
 */

/**
 * @swagger
 * /api/v1/attendance/weekly:
 *   get:
 *     summary: Get attendance records for the current week
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for the current week
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 count:
 *                   type: number
 *                   example: 175
 */

/**
 * @swagger
 * /api/v1/attendance/monthly:
 *   get:
 *     summary: Get attendance records for the current month
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for the current month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 count:
 *                   type: number
 *                   example: 750
 */

/**
 * @swagger
 * /api/v1/attendance/year:
 *   get:
 *     summary: Get attendance records for the current year
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for the current year
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 count:
 *                   type: number
 *                   example: 9000
 */

/**
 * @swagger
 * /api/v1/attendance/by-date:
 *   get:
 *     summary: Get attendance records for a specific date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Specific date (YYYY-MM-DD)
 *         example: "2024-01-15"
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Employee ID to filter by
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Attendance records for the specific date
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AttendanceRecord'
 *                 count:
 *                   type: number
 *                   example: 2
 *                 date:
 *                   type: string
 *                   example: "2024-01-15"
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/attendance/summary:
 *   get:
 *     summary: Get summary of attendance records in a date range
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *         example: "2024-01-31"
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: false
 *         description: Employee ID to filter by
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Attendance summary in the date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Fetched successfully
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceSummary'
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/attendance/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Attendance record details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       404:
 *         description: Attendance record not found
 */

/**
 * @swagger
 * /api/v1/attendance/update-timestamp/{id}:
 *   post:
 *     summary: Update attendance check time for a record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Attendance record ID
 *         required: true
 *         schema:
 *           type: string
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       description: New checkTime to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTimestamp'
 *     responses:
 *       200:
 *         description: Attendance timestamp updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance timestamp updated
 *                 data:
 *                   $ref: '#/components/schemas/AttendanceRecord'
 *       400:
 *         description: Bad request - missing or invalid checkTime
 *       404:
 *         description: Attendance record not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAttendance:
 *       type: object
 *       required:
 *         - checkTime
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Attendance date (optional, defaults to checkTime's date)
 *           example: "2024-01-15"
 *         checkTime:
 *           type: string
 *           description: The exact time of the attendance check (required)
 *           example: "2024-01-15 08:30:00"
 *         checkType:
 *           type: string
 *           enum: [PUNCHIN, PUNCHOUT]
 *           description: Check type (optional, auto-determined if missing)
 *           example: "PUNCHIN"
 *         verifyMode:
 *           type: number
 *           description: Verification mode used by device (optional)
 *           example: 15
 *         workCode:
 *           type: number
 *           description: Work code if applicable (optional)
 *           example: 0
 *         sensorId:
 *           type: string
 *           description: Sensor identifier (optional)
 *           example: "SENSOR001"
 *         deviceIp:
 *           type: string
 *           description: IP address of the device (optional)
 *           example: "192.168.1.100"
 *         deviceUserId:
 *           type: string
 *           description: User ID from the device (optional)
 *           example: "EMP001"
 *         isAbsent:
 *           type: boolean
 *           description: Marks the attendance as absent (optional, default false)
 *           example: false
 *     
 *     BulkDeviceRegistration:
 *       type: object
 *       required:
 *         - records
 *       properties:
 *         records:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateAttendance'
 *           description: Array of attendance records to create
 *           example: [
 *             {
 *               "date": "2024-01-15",
 *               "checkTime": "2024-01-15 08:00:00",
 *               "checkType": "PUNCHIN",
 *               "verifyMode": 15,
 *               "workCode": 0,
 *               "sensorId": "SENSOR001",
 *               "deviceIp": "192.168.1.100",
 *               "deviceUserId": "EMP001",
 *               "isAbsent": false
 *             }
 *           ]
 *     
 *     UpdateTimestamp:
 *       type: object
 *       required:
 *         - checkTime
 *       properties:
 *         checkTime:
 *           type: string
 *           description: New check time in ISO format
 *           example: "2024-01-15T08:45:00.000Z"
 *     
 *     AttendanceRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         employeeId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         date:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         checkTime:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T08:30:00.000Z"
 *         checkType:
 *           type: string
 *           enum: [PUNCHIN, PUNCHOUT]
 *           example: "PUNCHIN"
 *         verifyMode:
 *           type: number
 *           example: 15
 *         workCode:
 *           type: number
 *           example: 0
 *         sensorId:
 *           type: string
 *           example: "SENSOR001"
 *         deviceIp:
 *           type: string
 *           example: "192.168.1.100"
 *         deviceUserId:
 *           type: string
 *           example: "EMP001"
 *         isAbsent:
 *           type: boolean
 *           example: false
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T08:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T08:30:00.000Z"
 *     
 *     AttendanceSummary:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: number
 *           description: Total number of attendance records
 *           example: 62
 *         punchIns:
 *           type: number
 *           description: Total number of punch-ins
 *           example: 31
 *         punchOuts:
 *           type: number
 *           description: Total number of punch-outs
 *           example: 31
 *         absentDays:
 *           type: number
 *           description: Total number of absent days
 *           example: 0
 *         averageCheckInTime:
 *           type: string
 *           description: Average check-in time
 *           example: "08:30:00"
 *         averageCheckOutTime:
 *           type: string
 *           description: Average check-out time
 *           example: "17:30:00"
 */
