/**
 * @swagger
 * tags:
 *   name: ShiftDays
 *   description: Shift day management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShiftDay:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         shiftId:
 *           type: string
 *         dayNumber:
 *           type: integer
 *         dayType:
 *           type: string
 *           enum: [FULL_DAY, HALF_DAY, REST_DAY, NIGHT]
 *         startTime:
 *           type: string
 *           format: date-time
 *         endTime:
 *           type: string
 *           format: date-time
 *         breakTime:
 *           type: integer
 *         gracePeriod:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateShiftDay:
 *       type: object
 *       required:
 *         - shiftId
 *         - dayNumber
 *         - dayType
 *         - startTime
 *         - endTime
 *         - breakTime
 *         - gracePeriod
 *       properties:
 *         shiftId:
 *           type: string
 *           format: uuid
 *         dayNumber:
 *           type: integer
 *           example: 1
 *         dayType:
 *           type: string
 *           enum: [FULL_DAY, HALF_DAY, REST_DAY, NIGHT]
 *         startTime:
 *           type: string
 *           example: "08:00"
 *         endTime:
 *           type: string
 *           example: "17:00"
 *         breakTime:
 *           type: integer
 *           example: 60
 *         gracePeriod:
 *           type: integer
 *           example: 10
 *     UpdateShiftDay:
 *       type: object
 *       properties:
 *         dayNumber:
 *           type: integer
 *         dayType:
 *           type: string
 *           enum: [FULL_DAY, HALF_DAY, REST_DAY, NIGHT]
 *         startTime:
 *           type: string
 *           example: "08:00"
 *         endTime:
 *           type: string
 *           example: "17:00"
 *         breakTime:
 *           type: integer
 *         gracePeriod:
 *           type: integer
 */

/**
 * @swagger
 * /api/v1/shift-days:
 *   post:
 *     summary: Create a shift day
 *     tags: [ShiftDays]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShiftDay'
 *     responses:
 *       201:
 *         description: Shift day created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ShiftDay'
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/shift-days:
 *   get:
 *     summary: Get all shift days
 *     tags: [ShiftDays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: shiftId
 *         schema:
 *           type: string
 *         description: Optional shift ID to filter
 *     responses:
 *       200:
 *         description: A list of shift days
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ShiftDay'
 */

/**
 * @swagger
 * /api/v1/shift-days/{id}:
 *   get:
 *     summary: Get shift day by ID
 *     tags: [ShiftDays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shift day found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/ShiftDay'
 *       404:
 *         description: Shift day not found
 */

/**
 * @swagger
 * /api/v1/shift-days/{id}:
 *   post:
 *     summary: Update a shift day
 *     tags: [ShiftDays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShiftDay'
 *     responses:
 *       200:
 *         description: Shift day updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ShiftDay'
 *       404:
 *         description: Shift day not found
 */

/**
 * @swagger
 * /api/v1/shift-days/delete/{id}:
 *   post:
 *     summary: Delete a shift day
 *     tags: [ShiftDays]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shift day deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ShiftDay'
 *       404:
 *         description: Shift day not found
 */
