/**
 * @swagger
 * tags:
 *   name: Overtime-boundary-grace
 *   description: Manage overtime grace periods for companies
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     OvertimeGracePeriod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "c9d1f65a-78b4-4f9d-8897-5b2f2f0a98c3"
 *         companyId:
 *           type: string
 *           example: "a7d8b123-6c8d-4c9f-a1f2-b5a13c34fa77"
 *         gracePeriodMinutes:
 *           type: integer
 *           example: 10
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateOvertimeGracePeriodDto:
 *       type: object
 *       required:
 *
 *         - gracePeriodMinutes
 *       properties:
 *
 *         gracePeriodMinutes:
 *           type: integer
 *           example: 10
 *
 *
 *     UpdateOvertimeGracePeriodDto:
 *       type: object
 *       properties:
 *         gracePeriodMinutes:
 *           type: integer
 *           example: 15

 */

/**
 * @swagger
 * /api/v1/overtime-boundary-grace:
 *   post:
 *     summary: Create a new overtime grace period for a company
 *     tags: [Overtime Grace Period]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOvertimeGracePeriodDto'
 *     responses:
 *       201:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OvertimeGracePeriod'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Company not found
 *
 * /api/v1/overtime-boundary-grace/active:
 *   get:
 *     summary: Get all active overtime grace periods
 *     tags: [Overtime Grace Period]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active overtime grace periods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OvertimeGracePeriod'
 *
 * /api/v1/overtime-boundary-grace/all:
 *   get:
 *     summary: Get all overtime grace periods
 *     tags: [Overtime Grace Period]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all overtime grace periods
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OvertimeGracePeriod'
 *
 * /api/v1/overtime-boundary-grace/{id}:
 *   get:
 *     summary: Get a specific overtime grace period by ID
 *     tags: [Overtime Grace Period]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Overtime grace period found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OvertimeGracePeriod'
 *       404:
 *         description: Not found
 *   post:
 *     summary: Update an overtime grace period by ID
 *     tags: [Overtime Grace Period]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateOvertimeGracePeriodDto'
 *     responses:
 *       200:
 *         description: Updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OvertimeGracePeriod'
 *       404:
 *         description: Not found
 *
 * /api/v1/overtime-boundary-grace/delete/{id}:
 *   post:
 *     summary: Delete an overtime grace period by ID
 *     tags: [Overtime Grace Period]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       404:
 *         description: Not found
 */
