/**
 * @swagger
 * tags:
 *   name: Overtime Management
 *   description: Overtime management and reporting endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     EnhancedOvertimeSession:
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
 *         overtimeType:
 *           type: string
 *           enum: [UNSCHEDULED, EARLY_ARRIVAL, LATE_DEPARTURE, EXTENDED_SHIFT, HOLIDAY_WORK, REST_DAY_WORK]
 *           example: "EXTENDED_SHIFT"
 *         overtimeStatus:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           example: "PENDING"
 *         overtimeDuration:
 *           type: number
 *           example: 120
 *         overtimeDurationFormatted:
 *           type: string
 *           example: "2h 0m"
 *         notes:
 *           type: string
 *           nullable: true
 *           example: "Additional work hours"
 *     
 *     OvertimeSummary:
 *       type: object
 *       properties:
 *         totalOvertimeRecords:
 *           type: number
 *           example: 150
 *         totalEmployees:
 *           type: number
 *           example: 25
 *         totalOvertimeHours:
 *           type: number
 *           example: 450.5
 *         averageOvertimePerEmployee:
 *           type: number
 *           example: 18.02
 *         pendingOvertime:
 *           type: number
 *           example: 45
 *         approvedOvertime:
 *           type: number
 *           example: 95
 *         rejectedOvertime:
 *           type: number
 *           example: 10
 *         overtimeByType:
 *           type: object
 *           properties:
 *             UNSCHEDULED:
 *               type: number
 *               example: 20
 *             EARLY_ARRIVAL:
 *               type: number
 *               example: 15
 *             LATE_DEPARTURE:
 *               type: number
 *               example: 25
 *             EXTENDED_SHIFT:
 *               type: number
 *               example: 60
 *             HOLIDAY_WORK:
 *               type: number
 *               example: 20
 *             REST_DAY_WORK:
 *               type: number
 *               example: 10
 *     
 *     EnhancedOvertimeResponse:
 *       type: object
 *       properties:
 *         summary:
 *           $ref: '#/components/schemas/OvertimeSummary'
 *         sessions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnhancedOvertimeSession'
 *     
 *     OvertimeTable:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "overtime-123"
 *         workSessionId:
 *           type: string
 *           example: "session-456"
 *         deviceUserId:
 *           type: string
 *           example: "EMP001"
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-08-20"
 *         punchIn:
 *           type: string
 *           format: date-time
 *           example: "2025-08-20T07:15:00.000Z"
 *         punchOut:
 *           type: string
 *           format: date-time
 *           example: "2025-08-20T16:30:00.000Z"
 *         duration:
 *           type: number
 *           example: 555
 *         type:
 *           type: string
 *           enum: [UNSCHEDULED, EARLY_ARRIVAL, LATE_DEPARTURE, EXTENDED_SHIFT, HOLIDAY_WORK, REST_DAY_WORK]
 *           example: "EXTENDED_SHIFT"
 *         status:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *           example: "PENDING"
 *         notes:
 *           type: string
 *           nullable: true
 *           example: "Additional work hours"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         punchInSource:
 *           type: string
 *           example: "device"
 *         punchOutSource:
 *           type: string
 *           example: "device"
 *         punchInTime:
 *           type: string
 *           example: "07:15:00"
 *         punchOutTime:
 *           type: string
 *           example: "16:30:00"
 *         durationFormatted:
 *           type: string
 *           example: "9h 15m"
 *         workSession:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "session-456"
 *             deviceUserId:
 *               type: string
 *               example: "EMP001"
 *             date:
 *               type: string
 *               format: date-time
 *               example: "2025-08-20T00:00:00.000Z"
 *             punchIn:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               example: "2025-08-20T07:15:00.000Z"
 *             punchOut:
 *               type: string
 *               format: date-time
 *               nullable: true
 *               example: "2025-08-20T16:30:00.000Z"
 *             duration:
 *               type: number
 *               nullable: true
 *               example: 555
 *             shiftId:
 *               type: string
 *               nullable: true
 *               example: "shift-123"
 *             earlyMinutes:
 *               type: number
 *               example: 0
 *             lateMinutes:
 *               type: number
 *               example: 0
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 *             punchInSource:
 *               type: string
 *               example: "device"
 *             punchOutSource:
 *               type: string
 *               example: "device"
 *             shift:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "shift-123"
 *                 name:
 *                   type: string
 *                   example: "Regular Shift"
 *                 shiftType:
 *                   type: string
 *                   example: "FIXED_WEEKLY"
 */

/**
 * @swagger
 * /api/v1/overtime/today:
 *   get:
 *     summary: Get today's overtime for all employees
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: Today's overtime retrieved successfully
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
 *                   example: "Today's overtime retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedOvertimeSession'
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
 *                         overtimeType:
 *                           type: string
 *                           example: "all"
 *                         overtimeStatus:
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
 * /api/v1/overtime/date-range:
 *   get:
 *     summary: Get overtime records within a date range
 *     tags: [Overtime Management]
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
 *         description: Date range overtime retrieved successfully
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
 *                   example: "Date range overtime retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedOvertimeSession'
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
 *                         overtimeType:
 *                           type: string
 *                           example: "all"
 *                         overtimeStatus:
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
 * /api/v1/overtime/current-week:
 *   get:
 *     summary: Get current week's overtime for all employees
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:

 *       - in: query
 *         name: overtimeStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by overtime status
 *         example: "PENDING"
 *     responses:
 *       200:
 *         description: Current week overtime retrieved successfully
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
 *                   example: "Current week overtime retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedOvertimeSession'
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
 *                         overtimeType:
 *                           type: string
 *                           example: "all"
 *                         overtimeStatus:
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
 * /api/v1/overtime/current-month:
 *   get:
 *     summary: Get current month's overtime for all employees
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceUserId
 *         schema:
 *           type: string
 *         description: Filter by specific employee device ID
 *         example: "EMP001"

 *       - in: query
 *         name: overtimeStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by overtime status
 *         example: "PENDING"
 *     responses:
 *       200:
 *         description: Current month overtime retrieved successfully
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
 *                   example: "Current month overtime retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedOvertimeSession'
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
 *                         overtimeType:
 *                           type: string
 *                           example: "all"
 *                         overtimeStatus:
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
 * /api/v1/overtime/current-year:
 *   get:
 *     summary: Get current year's overtime for all employees
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:

 *     responses:
 *       200:
 *         description: Current year overtime retrieved successfully
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
 *                   example: "Current year overtime retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedOvertimeSession'
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
 *                         overtimeType:
 *                           type: string
 *                           example: "all"
 *                         overtimeStatus:
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
 * /api/v1/overtime/by-date:
 *   get:
 *     summary: Get overtime records for a specific date
 *     tags: [Overtime Management]
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
 *       - in: query
 *         name: deviceUserId
 *         schema:
 *           type: string
 *         description: Filter by specific employee device ID
 *         example: "EMP001"
 *       - in: query
 *         name: shiftId
 *         schema:
 *           type: string
 *         description: Filter by specific shift
 *         example: "shift-123"
 *       - in: query
 *         name: overtimeType
 *         schema:
 *           type: string
 *           enum: [UNSCHEDULED, EARLY_ARRIVAL, LATE_DEPARTURE, EXTENDED_SHIFT, HOLIDAY_WORK, REST_DAY_WORK]
 *         description: Filter by overtime type
 *         example: "EXTENDED_SHIFT"
 *       - in: query
 *         name: overtimeStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by overtime status
 *         example: "PENDING"
 *     responses:
 *       200:
 *         description: Overtime for specific date retrieved successfully
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
 *                   example: "Overtime by date retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedOvertimeSession'
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
 *                         overtimeType:
 *                           type: string
 *                           example: "all"
 *                         overtimeStatus:
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
 * /api/v1/overtime/summary:
 *   get:
 *     summary: Get comprehensive overtime summary with statistics
 *     tags: [Overtime Management]
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
 *       - in: query
 *         name: deviceUserId
 *         schema:
 *           type: string
 *         description: Filter by specific employee device ID
 *         example: "EMP001"
 *       - in: query
 *         name: shiftId
 *         schema:
 *           type: string
 *         description: Filter by specific shift
 *         example: "shift-123"
 *       - in: query
 *         name: overtimeType
 *         schema:
 *           type: string
 *           enum: [UNSCHEDULED, EARLY_ARRIVAL, LATE_DEPARTURE, EXTENDED_SHIFT, HOLIDAY_WORK, REST_DAY_WORK]
 *         description: Filter by overtime type
 *         example: "EXTENDED_SHIFT"
 *       - in: query
 *         name: overtimeStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by overtime status
 *         example: "PENDING"
 *     responses:
 *       200:
 *         description: Overtime summary retrieved successfully
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
 *                   example: "Overtime summary retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedOvertimeSession'
 *                 summary:
 *                   $ref: '#/components/schemas/OvertimeSummary'
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
 *                         overtimeType:
 *                           type: string
 *                           example: "all"
 *                         overtimeStatus:
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
 * /api/v1/overtime:
 *   post:
 *     summary: Create a new overtime record
 *     tags: [Overtime Management]
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
 *               - punchIn
 *               - punchOut
 *               - type
 *             properties:
 *               deviceUserId:
 *                 type: string
 *                 description: Employee device user ID
 *                 example: "EMP001"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date for the overtime (YYYY-MM-DD)
 *                 example: "2025-08-20"
 *               punchIn:
 *                 type: string
 *                 description: Punch in time (HH:MM:SS)
 *                 example: "07:15:00"
 *               punchInSource:
 *                 type: string
 *                 description: Source of punch in (device, manual, system)
 *                 example: "device"
 *                 default: "manual"
 *               punchOut:
 *                 type: string
 *                 description: Punch out time (HH:MM:SS)
 *                 example: "16:30:00"
 *               punchOutSource:
 *                 type: string
 *                 description: Source of punch out (device, manual, system)
 *                 example: "device"
 *                 default: "manual"
 *               type:
 *                 type: string
 *                 enum: [UNSCHEDULED, EARLY_ARRIVAL, LATE_DEPARTURE, EXTENDED_SHIFT, HOLIDAY_WORK, REST_DAY_WORK]
 *                 description: Type of overtime
 *                 example: "EXTENDED_SHIFT"
 *               workSessionId:
 *                 type: string
 *                 description: Optional work session ID to link
 *                 example: "session-123"
 *               notes:
 *                 type: string
 *                 description: Additional notes about the overtime
 *                 example: "Additional work hours for project completion"
 *     responses:
 *       201:
 *         description: Overtime record created successfully
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
 *                   example: "Overtime record created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/OvertimeTable'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   
 *   get:
 *     summary: Get all overtime records with filters
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: deviceUserId
 *         schema:
 *           type: string
 *         description: Filter by specific employee device ID
 *         example: "EMP001"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *         example: "2025-08-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *         example: "2025-08-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [UNSCHEDULED, EARLY_ARRIVAL, LATE_DEPARTURE, EXTENDED_SHIFT, HOLIDAY_WORK, REST_DAY_WORK]
 *         description: Filter by overtime type
 *         example: "EXTENDED_SHIFT"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED]
 *         description: Filter by overtime status
 *         example: "PENDING"
 *       - in: query
 *         name: workSessionId
 *         schema:
 *           type: string
 *         description: Filter by work session ID
 *         example: "session-123"
 *     responses:
 *       200:
 *         description: Overtime records retrieved successfully
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
 *                   example: "Overtime records retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OvertimeTable'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     totalRecords:
 *                       type: number
 *                       example: 150
 *                     filters:
 *                       type: object
 *                       properties:
 *                         deviceUserId:
 *                           type: string
 *                           example: "all"
 *                         startDate:
 *                           type: string
 *                           example: "all"
 *                         endDate:
 *                           type: string
 *                           example: "all"
 *                         type:
 *                           type: string
 *                           example: "all"
 *                         status:
 *                           type: string
 *                           example: "all"
 *                         workSessionId:
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
 * /api/v1/overtime/{id}:
 *   get:
 *     summary: Get overtime record by ID
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Overtime record ID
 *         example: "overtime-123"
 *     responses:
 *       200:
 *         description: Overtime record retrieved successfully
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
 *                   example: "Overtime record retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/OvertimeTable'
 *       400:
 *         description: Invalid overtime record ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Overtime record not found
 *       500:
 *         description: Internal server error
 *   
 *   post:
 *     summary: Update existing overtime record
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Overtime record ID
 *         example: "overtime-123"
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
 *               punchOutSource:
 *                 type: string
 *                 description: Source of punch out (device, manual, system)
 *                 example: "manual"
 *               type:
 *                 type: string
 *                 enum: [UNSCHEDULED, EARLY_ARRIVAL, LATE_DEPARTURE, EXTENDED_SHIFT, HOLIDAY_WORK, REST_DAY_WORK]
 *                 description: Updated overtime type
 *                 example: "EXTENDED_SHIFT"
 *               workSessionId:
 *                 type: string
 *                 description: Updated work session ID
 *                 example: "session-456"
 *               notes:
 *                 type: string
 *                 description: Updated notes
 *                 example: "Updated overtime notes"
 *     responses:
 *       200:
 *         description: Overtime record updated successfully
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
 *                   example: "Overtime record updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/OvertimeTable'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Overtime record not found
 *       500:
 *         description: Internal server error
 *   

 */



/**
 * @swagger
 * /api/v1/overtime/delete{id}:
 *   get:
 *     summary: Get overtime record by ID
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Overtime record ID
 *         example: "overtime-123"
 *     responses:
 *       200:
 *         description: Overtime record retrieved successfully
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
 *                   example: "Overtime record retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/OvertimeTable'
 *       400:
 *         description: Invalid overtime record ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Overtime record not found
 *       500:
 *         description: Internal server error
 *   
 *   post:
 *     summary: Delete overtime record by ID
 *     tags: [Overtime Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Overtime record ID to delete
 *         example: "overtime-123"
 *     responses:
 *       200:
 *         description: Overtime record deleted successfully
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
 *                   example: "Overtime record deleted successfully"
 *       400:
 *         description: Invalid overtime record ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Overtime record not found
 *       500:
 *         description: Internal server error
 */

// /**
//  * @swagger
//  * /api/v1/overtime/{id}/status:
//  *   patch:
//  *     summary: Update overtime record status
//  *     tags: [Overtime Management]
//  *     security:
//  *       - bearerAuth: []
//  *     parameters:
//  *       - in: path
//  *         name: id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         description: Overtime record ID
//  *         example: "overtime-123"
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - status
//  *             properties:
//  *               status:
//  *                 type: string
//  *                 enum: [PENDING, APPROVED, REJECTED]
//  *                 description: New overtime status
//  *                 example: "APPROVED"
//  *               notes:
//  *                 type: string
//  *                 description: Additional notes for status change
//  *                 example: "Approved by manager"
//  *     responses:
//  *       200:
//  *         description: Overtime status updated successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: "Overtime status updated successfully"
//  *                 data:
//  *                   $ref: '#/components/schemas/OvertimeTable'
//  *       400:
//  *         description: Validation error
//  *       401:
//  *         description: Unauthorized
//  *       404:
//  *         description: Overtime record not found
//  *       500:
//  *         description: Internal server error
//  */ 