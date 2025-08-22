/**
 * @swagger
 * tags:
 *   name: WorkingCalendar
 *   description: Manage working calendar entries
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WorkingCalendarEntry:
 *       type: object
 *       required:
 *         - date
 *         - dayType
 *         - companyId
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the working calendar entry
 *           example: "60d21b4667d0d8992e610c85"
 *         date:
 *           type: string
 *           format: date
 *           description: The date of the calendar entry
 *           example: "2025-07-27"
 *         dayType:
 *           type: string
 *           description: Type of day (e.g., "WORKING_DAY", "HOLIDAY", "WEEKEND")
 *           example: "WORKING_DAY"
 *         description:
 *           type: string
 *           description: Optional description of the calendar entry
 *           example: "Regular WORKING_DAY"
 *         isActive:
 *           type: boolean
 *           description: Indicates if this entry is active
 *           example: true
 *         companyId:
 *           type: string
 *           description: ID of the company this calendar entry belongs to
 *           example: "company123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-26T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-07-26T10:00:00Z"
 *     CreateWorkingCalendar:
 *       type: object
 *       required:
 *         - date
 *         - dayType
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-07-27"
 *         dayType:
 *           type: string
 *           example: "WORKING_DAY"
 *         description:
 *           type: string
 *           example: "Regular WORKING_DAY"
 *         isActive:
 *           type: boolean
 *           example: true
 *     UpdateWorkingCalendar:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-07-28"
 *         dayType:
 *           type: string
 *           example: "HOLIDAY"
 *         description:
 *           type: string
 *           example: "Public holiday"
 *         isActive:
 *           type: boolean
 *           example: false
 *     BulkUploadWorkingCalendar:
 *       type: object
 *       required:
 *         - entries
 *       properties:
 *         entries:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CreateWorkingCalendar'
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWorkingCalendar:
 *       type: object
 *       required:
 *         - year
 *         - date
 *         - dayType
 *       properties:
 *         year:
 *           type: integer
 *           minimum: 1900
 *           maximum: 2100
 *           example: 2025
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *         dayType:
 *           type: string
 *           enum: [WORKING_DAY, HOLIDAY]
 *           example: HOLIDAY
 *         description:
 *           type: string
 *           example: "Labor Day"
 *         isActive:
 *           type: boolean
 *           example: true
 *         companyId:
 *           type: string
 *           format: uuid
 *           description: Injected from auth
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 * 
 *     WorkingCalendarEntry:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateWorkingCalendar'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *               example: "c2a1d1b4-5f7d-44f8-b65a-123456789abc"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2025-01-01T12:00:00Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2025-01-01T12:30:00Z"
 *
 * /api/v1/working-calendar:
 *   post:
 *     summary: Create a new working calendar entry
 *     tags: [WorkingCalendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkingCalendar'
 *     responses:
 *       201:
 *         description: Working calendar entry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Working calendar entry created successfully
 *                 data:
 *                   $ref: '#/components/schemas/WorkingCalendarEntry'
 *       400:
 *         description: Bad Request
 * 
 *   get:
 *     summary: Get all working calendar entries with optional filters
 *     tags: [WorkingCalendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filter by year
 *       - in: query
 *         name: dayType
 *         schema:
 *           type: string
 *           enum: [WORKING_DAY, HOLIDAY]
 *         description: Filter by day type
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by exact date
 *     responses:
 *       200:
 *         description: List of working calendar entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkingCalendarEntry'
 *                 count:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Bad Request
 */


/**
 * @swagger
 * /api/v1/working-calendar/date-range:
 *   get:
 *     summary: Get working calendar entries within a date range
 *     tags: [WorkingCalendar]
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
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Working calendar entries in the specified date range
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkingCalendarEntry'
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/working-calendar/{id}:
 *   get:
 *     summary: Get working calendar entry by ID
 *     tags: [WorkingCalendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Working calendar entry ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Working calendar entry details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/WorkingCalendarEntry'
 *       404:
 *         description: Working calendar entry not found
 */

/**
 * @swagger
 * /api/v1/working-calendar/bulk-upload:
 *   post:
 *     summary: Bulk upload working calendar entries
 *     tags: [WorkingCalendar]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkUploadWorkingCalendar'
 *     responses:
 *       200:
 *         description: Working calendar entries uploaded successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/working-calendar/{id}:
 *   post:
 *     summary: Update a working calendar entry by ID
 *     tags: [WorkingCalendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Working calendar entry ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Fields to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkingCalendar'
 *     responses:
 *       200:
 *         description: Working calendar entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Working calendar entry updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/WorkingCalendarEntry'
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Working calendar entry not found
 */

/**
 * @swagger
 * /api/v1/working-calendar/delete/{id}:
 *   post:
 *     summary: Delete a working calendar entry by ID
 *     tags: [WorkingCalendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Working calendar entry ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Working calendar entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Working calendar entry deleted successfully
 */
