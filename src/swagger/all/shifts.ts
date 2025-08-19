/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Shift management with support for FIXED_WEEKLY and ROTATING shift types
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShiftDayData:
 *       type: object
 *       required:
 *         - dayNumber
 *         - dayType
 *         - startTime
 *         - endTime
 *         - breakTime
 *         - gracePeriod
 *       properties:
 *         dayNumber:
 *           type: integer
 *           minimum: 1
 *           maximum: 7
 *           description: Day number (1=Monday, 7=Sunday)
 *           example: 1
 *         dayType:
 *           type: string
 *           enum: [FULL_DAY, HALF_DAY, REST_DAY]
 *           description: Type of work day
 *           example: "FULL_DAY"
 *         startTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$"
 *           description: Start time for the day in HH:MM:SS format (24-hour)
 *           example: "09:00:00"
 *         endTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$"
 *           description: End time for the day in HH:MM:SS format (24-hour)
 *           example: "17:00:00"
 *         breakTime:
 *           type: integer
 *           minimum: 0
 *           description: Break time in minutes
 *           example: 60
 *         gracePeriod:
 *           type: integer
 *           minimum: 0
 *           description: Grace period in minutes
 *           example: 15
 *
 *     CreateShift:
 *       type: object
 *       required:
 *         - name
 *         - shiftType
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           description: Shift name (minimum 3 characters)
 *           example: "Regular 9-5 Shift"
 *         shiftType:
 *           type: string
 *           enum: [FIXED_WEEKLY, ROTATING]
 *           description: Type of shift pattern
 *           example: "FIXED_WEEKLY"
 *         companyId:
 *           type: string
 *           format: uuid
 *           description: Company ID (injected from auth)
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         patternDays:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShiftDayData'
 *           description: Pattern days for FIXED_WEEKLY shifts (required for FIXED_WEEKLY)
 *           example: [
 *             {
 *               "dayNumber": 1,
 *               "dayType": "FULL_DAY",
 *               "startTime": "09:00:00",
 *               "endTime": "17:00:00",
 *               "breakTime": 60,
 *               "gracePeriod": 15
 *             }
 *           ]
 *
 *     UpdateShift:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           description: Shift name (minimum 3 characters)
 *           example: "Updated Regular 9-5 Shift"
 *         shiftType:
 *           type: string
 *           enum: [FIXED_WEEKLY, ROTATING]
 *           description: Type of shift pattern
 *           example: "FIXED_WEEKLY"
 *         patternDays:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShiftDayData'
 *           description: Pattern days for FIXED_WEEKLY shifts
 *         isActive:
 *           type: boolean
 *           description: Whether the shift is active
 *           example: true
 *
 *     Shift:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         name:
 *           type: string
 *           example: "Regular 9-5 Shift"
 *         shiftType:
 *           type: string
 *           enum: [FIXED_WEEKLY, ROTATING]
 *           example: "FIXED_WEEKLY"
 *         companyId:
 *           type: string
 *           format: uuid
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         isActive:
 *           type: boolean
 *           example: true
 *         patternDays:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ShiftDayData'
 *           description: Pattern days for the shift
 *         employeeShifts:
 *           type: array
 *           description: Employee shift assignments
 *         company:
 *           type: object
 *           description: Company information
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00.000Z"
 */

/**
 * @swagger
 * /api/v1/shifts:
 *   post:
 *     summary: Create a new shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShift'
 *     responses:
 *       201:
 *         description: Shift created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shift created
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Bad Request - Missing required fields or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Pattern days are required for FIXED_WEEKLY shifts"
 *       409:
 *         description: Conflict - Shift already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shift already exists"
 */

/**
 * @swagger
 * /api/v1/shifts:
 *   get:
 *     summary: Get all shifts for the authenticated company
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of active shifts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Shift'
 *                 count:
 *                   type: integer
 *                   example: 3
 */

/**
 * @swagger
 * /api/v1/shifts/{id}:
 *   get:
 *     summary: Get a shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Shift found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Shift not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shift not found"
 */

/**
 * @swagger
 * /api/v1/shifts/{id}:
 *   post:
 *     summary: Update a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       description: Fields to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShift'
 *     responses:
 *       200:
 *         description: Shift updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shift updated
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       400:
 *         description: Bad Request - Invalid data
 *       404:
 *         description: Shift not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shift not found"
 */

/**
 * @swagger
 * /api/v1/shifts/delete/{id}:
 *   post:
 *     summary: Soft delete a shift by ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Shift deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Shift deactivated
 *                 data:
 *                   $ref: '#/components/schemas/Shift'
 *       404:
 *         description: Shift not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shift not found"
 */
