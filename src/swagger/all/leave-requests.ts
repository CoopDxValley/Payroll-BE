/**
 * @swagger
 * tags:
 *   name: Leave Types
 *   description: Manage leave request types for employees
 */

/**
 * @swagger
 * /api/v1/leave-requests:
 *   post:
 *     summary: Create a new leave request type
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - maxDaysYearly
 *               - isPaid
 *               - carryForward
 *             properties:
 *               name:
 *                 type: string
 *                 example: Annual Leave
 *               description:
 *                 type: string
 *                 example: Paid time off granted annually
 *               maxDaysYearly:
 *                 type: integer
 *                 example: 30
 *               isPaid:
 *                 type: boolean
 *                 example: true
 *               carryForward:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Leave request type created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/leave-requests:
 *   get:
 *     summary: Get all leave request types
 *     tags: [Leave Types]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of leave request types
 */

/**
 * @swagger
 * /api/v1/leave-requests/{id}:
 *   get:
 *     summary: Get a leave request type by ID
 *     tags: [Leave Types]
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
 *         description: Leave request type found
 *       404:
 *         description: Leave request type not found
 */

/**
 * @swagger
 * /api/v1/leave-requests/{id}:
 *   post:
 *     summary: Update a leave request type
 *     tags: [Leave Types]
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
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               maxDaysYearly:
 *                 type: integer
 *               isPaid:
 *                 type: boolean
 *               carryForward:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Leave request type updated
 *       404:
 *         description: Leave request type not found
 */

/**
 * @swagger
 * /api/v1/leave-requests/delete/{id}:
 *   post:
 *     summary: Soft delete a leave request type
 *     tags: [Leave Types]
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
 *         description: Leave request type deleted
 *       404:
 *         description: Leave request type not found
 */
