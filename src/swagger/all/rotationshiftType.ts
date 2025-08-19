/**
 * @swagger
 * tags:
 *   name: RotatingShiftTypes
 *   description: Rotating shift type management
 */

/**
 * @swagger
 * /api/v1/rotating-shift-types:
 *   post:
 *     summary: Create a new rotating shift type
 *     tags: [RotatingShiftTypes]
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
 *               - startTime
 *               - endTime
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Morning Shift"
 *               startTime:
 *                 type: string
 *                 example: "06:00:00"
 *               endTime:
 *                 type: string
 *                 example: "14:00:00"
 *     responses:
 *       201:
 *         description: Rotating shift type created successfully
 *       400:
 *         description: Invalid input
 */

/**
 * @swagger
 * /api/v1/rotating-shift-types:
 *   get:
 *     summary: Get all rotating shift types
 *     tags: [RotatingShiftTypes]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       200:
 *         description: List of all rotating shift types
 */

/**
 * @swagger
 * /api/v1/rotating-shift-types/{id}:
 *   get:
 *     summary: Get a specific rotating shift type by ID
 *     tags: [RotatingShiftTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rotating shift type ID
 *     responses:
 *       200:
 *         description: Shift type details
 *       404:
 *         description: Shift type not found
 */

/**
 * @swagger
 * /api/v1/rotating-shift-types/{id}:
 *   post:
 *     summary: Update a rotating shift type
 *     tags: [RotatingShiftTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rotating shift type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shift type updated successfully
 *       404:
 *         description: Shift type not found
 */

/**
 * @swagger
 * /api/v1/rotating-shift-types/delete/{id}:
 *   post:
 *     summary: Delete a rotating shift type
 *     tags: [RotatingShiftTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Rotating shift type ID
 *     responses:
 *       200:
 *         description: Shift type deleted successfully
 *       404:
 *         description: Shift type not found
 */

