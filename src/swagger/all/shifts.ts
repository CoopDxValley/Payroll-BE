/**
 * @swagger
 * tags:
 *   name: Shifts
 *   description: Shift management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateShift:
 *       type: object
 *       required:
 *         - name
 *         - cycleDays
 *       properties:
 *         name:
 *           type: string
 *           example: "Day Shift"
 *         cycleDays:
 *           type: integer
 *           example: 7
 *     UpdateShift:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Updated Shift Name"
 *         cycleDays:
 *           type: integer
 *           example: 14
 *     Shift:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         cycleDays:
 *           type: integer
 *         companyId:
 *           type: string
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *         description: Bad Request
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
 *         description: Shift ID
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
 *         description: Shift ID
 *     requestBody:
 *       description: Fields to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShift'
 *     responses:
 *       200:
 *         description: Shift updated
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
 *       404:
 *         description: Shift not found
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
 *         description: Shift ID
 *     responses:
 *       200:
 *         description: Shift deactivated
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
 */
