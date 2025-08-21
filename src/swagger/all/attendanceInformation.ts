/**
 * @swagger
 * tags:
 *   name: Attendances
 *   description: Attendances queries and reporting endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EnhancedSession:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *         employeeName:
 *           type: string
 *           example: "John Doe"
 *         phoneNumber:
 *           type: string
 *           example: "+251911234567"
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-08-20"
 *         punchIn:
 *           type: string
 *           nullable: true
 *           example: "07:15:00"
 *         punchOut:
 *           type: string
 *           nullable: true
 *           example: "16:30:00"
 *         punchInSource:
 *           type: string
 *           example: "device"
 *         punchOutSource:
 *           type: string
 *           example: "device"
 *         durationMinutes:
 *           type: number
 *           example: 555
 *         durationHours:
 *           type: number
 *           example: 9.25
 *         durationFormatted:
 *           type: string
 *           example: "9h 15m"
 *         shiftType:
 *           type: string
 *           example: "FIXED_WEEKLY"
 *
 *     AttendanceSummary:
 *       type: object
 *       properties:
 *         totalSessions:
 *           type: number
 *           example: 150
 *         totalEmployees:
 *           type: number
 *           example: 25
 *         averageDuration:
 *           type: number
 *           example: 8.5
 *         totalOvertime:
 *           type: number
 *           example: 45.5
 *         earlyArrivals:
 *           type: number
 *           example: 12
 *         lateDepartures:
 *           type: number
 *           example: 8
 *
 *     EnhancedAttendanceResponse:
 *       type: object
 *       properties:
 *         summary:
 *           $ref: '#/components/schemas/AttendanceSummary'
 *         sessions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnhancedSession'
 *
 *     AttendanceFilters:
 *       type: object
 *       properties:
 *         deviceUserId:
 *           type: string
 *           description: Filter by specific employee device ID
 *           example: "EMP001"
 *         shiftId:
 *           type: string
 *           description: Filter by specific shift
 *           example: "shift-123"
 *
 *     DateRangeQuery:
 *       type: object
 *       required:
 *         - startDate
 *         - endDate
 *       properties:
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date for the range (YYYY-MM-DD)
 *           example: "2025-08-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date for the range (YYYY-MM-DD)
 *           example: "2025-08-31"
 *         deviceUserId:
 *           type: string
 *           description: Filter by specific employee device ID
 *           example: "EMP001"
 *         shiftId:
 *           type: string
 *           description: Filter by specific shift
 *           example: "shift-123"
 *
 *     SingleDateQuery:
 *       type: object
 *       required:
 *         - date
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           description: Specific date to query (YYYY-MM-DD)
 *           example: "2025-08-20"
 *         deviceUserId:
 *           type: string
 *           description: Filter by specific employee device ID
 *           example: "EMP001"
 *         shiftId:
 *           type: string
 *           description: Filter by specific shift
 *           example: "shift-123"
 */

/**
 * @swagger
 * /api/v1/attendances/today:
 *   get:
 *     summary: Get today's attendance for all employees
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: Today's attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Today's attendance retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedSession'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: number
 *                       example: 25
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         shiftId:
 *                           type: string
 *                           example: "all"
 *                         companyId:
 *                           type: string
 *                           example: "company-123"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/date-range:
 *   get:
 *     summary: Get attendance records within a date range
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the range (YYYY-MM-DD)
 *         example: "2025-08-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the range (YYYY-MM-DD)
 *         example: "2025-08-31"

 *     responses:
 *       200:
 *         description: Date range attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Date range attendance retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedSession'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           example: "2025-08-01"
 *                         endDate:
 *                           type: string
 *                           example: "2025-08-31"
 *                     totalRecords:
 *                       type: number
 *                       example: 750
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         shiftId:
 *                           type: string
 *                           example: "all"
 *                         companyId:
 *                           type: string
 *                           example: "company-123"
 *       400:
 *         description: Validation error or invalid date range
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/current-week:
 *   get:
 *     summary: Get current week's attendance for all employees
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: Current week attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Current week attendance retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedSession'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     weekRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           example: "2025-08-18"
 *                         endDate:
 *                           type: string
 *                           example: "2025-08-24"
 *                     totalRecords:
 *                       type: number
 *                       example: 175
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         shiftId:
 *                           type: string
 *                           example: "all"
 *                         companyId:
 *                           type: string
 *                           example: "company-123"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/current-month:
 *   get:
 *     summary: Get current month's attendance for all employees
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: Current month attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Current month attendance retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedSession'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     monthRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           example: "2025-08-01"
 *                         endDate:
 *                           type: string
 *                           example: "2025-08-31"
 *                     totalRecords:
 *                       type: number
 *                       example: 750
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         shiftId:
 *                           type: string
 *                           example: "all"
 *                         companyId:
 *                           type: string
 *                           example: "company-123"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/current-year:
 *   get:
 *     summary: Get current year's attendance for all employees
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: Current year attendance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Current year attendance retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedSession'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     yearRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           example: "2025-01-01"
 *                         endDate:
 *                           type: string
 *                           example: "2025-12-31"
 *                     totalRecords:
 *                       type: number
 *                       example: 9000
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         shiftId:
 *                           type: string
 *                           example: "all"
 *                         companyId:
 *                           type: string
 *                           example: "company-123"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/by-date:
 *   get:
 *     summary: Get attendance records for a specific date
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Specific date to query (YYYY-MM-DD)
 *         example: "2025-08-20"

 *     responses:
 *       200:
 *         description: Attendance for specific date retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Attendance by date retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedSession'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     date:
 *                       type: string
 *                       example: "2025-08-20"
 *                     totalRecords:
 *                       type: number
 *                       example: 25
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         shiftId:
 *                           type: string
 *                           example: "all"
 *                         companyId:
 *                           type: string
 *                           example: "company-123"
 *       400:
 *         description: Validation error or date parameter missing
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/summary:
 *   get:
 *     summary: Get comprehensive attendance summary with statistics
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for the summary (YYYY-MM-DD)
 *         example: "2025-08-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for the summary (YYYY-MM-DD)
 *         example: "2025-08-31"

 *     responses:
 *       200:
 *         description: Attendance summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Attendance summary retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedSession'
 *                 summary:
 *                   $ref: '#/components/schemas/AttendanceSummary'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                           example: "2025-08-01"
 *                         endDate:
 *                           type: string
 *                           example: "2025-08-31"
 *                     totalRecords:
 *                       type: number
 *                       example: 750
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         shiftId:
 *                           type: string
 *                           example: "all"
 *                         companyId:
 *                           type: string
 *                           example: "company-123"
 *       400:
 *         description: Validation error or missing date parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances:
 *   post:
 *     summary: Create a new work session
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deviceUserId
 *               - date
 *             properties:
 *               deviceUserId:
 *                 type: string
 *                 description: Employee device user ID
 *                 example: "EMP001"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for the work session (YYYY-MM-DD)
 *                 example: "2025-08-17"
 *               punchIn:
 *                 type: string
 *                 description: Punch in time (HH:MM:SS)
 *                 example: "07:30:00"

 *               punchOut:
 *                 type: string
 *                 description: Punch out time (HH:MM:SS)
 *                 example: "08:30:00"


 *     responses:
 *       201:
 *         description: Work session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Work session created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *                     deviceUserId:
 *                       type: string
 *                       example: "EMP001"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T00:00:00.000Z"
 *                     punchIn:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T04:30:00.000Z"
 *                     punchOut:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T05:30:00.000Z"
 *                     duration:
 *                       type: number
 *                       example: 60
 *                     shiftId:
 *                       type: string
 *                       example: "shift-123"
 *                     earlyMinutes:
 *                       type: number
 *                       example: 0
 *                     lateMinutes:
 *                       type: number
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     punchInSource:
 *                       type: string
 *                       example: "device"
 *                     punchOutSource:
 *                       type: string
 *                       example: "device"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/{id}:
 *   get:
 *     summary: Get work session by ID
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Work session ID
 *         example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *     responses:
 *       200:
 *         description: Work session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Work session retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *                     deviceUserId:
 *                       type: string
 *                       example: "EMP001"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T00:00:00.000Z"
 *                     punchIn:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T04:30:00.000Z"
 *                     punchOut:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T05:30:00.000Z"
 *                     duration:
 *                       type: number
 *                       example: 60
 *                     shiftId:
 *                       type: string
 *                       example: "shift-123"
 *                     earlyMinutes:
 *                       type: number
 *                       example: 0
 *                     lateMinutes:
 *                       type: number
 *                       example: 0
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     punchInSource:
 *                       type: string
 *                       example: "device"
 *                     punchOutSource:
 *                       type: string
 *                       example: "device"
 *                     shift:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "shift-123"
 *                         name:
 *                           type: string
 *                           example: "Regular Shift"
 *                         shiftType:
 *                           type: string
 *                           example: "FIXED_WEEKLY"
 *                     OvertimeTable:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "overtime-123"
 *                           type:
 *                             type: string
 *                             example: "EXTENDED_SHIFT"
 *                           status:
 *                             type: string
 *                             example: "PENDING"
 *                           duration:
 *                             type: number
 *                             example: 30
 *       400:
 *         description: Invalid work session ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Work session not found
 *       500:
 *         description: Internal server error
 *   
 *   post:
 *     summary: Update existing work session
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Work session ID
 *         example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               punchIn:
 *                 type: string
 *                 description: Updated punch in time (HH:MM:SS)
 *                 example: "07:00:00"
 *               punchInSource:
 *                 type: string
 *                 description: Source of punch in (device, manual, system)
 *                 example: "manual"
 *               punchOut:
 *                 type: string
 *                 description: Updated punch out time (HH:MM:SS)
 *                 example: "17:00:00"

 *     responses:
 *       200:
 *         description: Work session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Work session updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *                     deviceUserId:
 *                       type: string
 *                       example: "EMP001"
 *                     date:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T00:00:00.000Z"
 *                     punchIn:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T04:00:00.000Z"
 *                     punchOut:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T14:00:00.000Z"
 *                     duration:
 *                       type: number
 *                       example: 600
 *                     shiftId:
 *                       type: string
 *                       example: "shift-456"
 *                     earlyMinutes:
 *                       type: number
 *                       example: 30
 *                     lateMinutes:
 *                       type: number
 *                       example: 300
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     punchInSource:
 *                       type: string
 *                       example: "manual"
 *                     punchOutSource:
 *                       type: string
 *                       example: "manual"
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Work session not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/attendances/delete/{id}:
 *   post:
 *     summary: Delete work session by ID
 *     tags: [Attendances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Work session ID to delete
 *         example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *     responses:
 *       200:
 *         description: Work session deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Work session deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "f907de32-9336-4357-b1dd-6f64e15d3cf0"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-17T10:00:00.000Z"
 *       400:
 *         description: Invalid work session ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Work session not found
 *       500:
 *         description: Internal server error
 */
