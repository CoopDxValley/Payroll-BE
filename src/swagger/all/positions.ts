/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: Position management
 */

/**
 * @swagger
 * /api/v1/positions:
 *   post:
 *     summary: Create a new position
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - positionName
 *               - description
 *             properties:
 *               positionName:
 *                 type: string
 *                 example: Manager
 *               description:
 *                 type: string
 *                 example: Responsible for building and maintaining ...
 *     responses:
 *       201:
 *         description: Position created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/positions:
 *   get:
 *     summary: Get all positions
 *     tags: [Positions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of positions
 */

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   get:
 *     summary: Get a position by ID
 *     tags: [Positions]
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
 *         description: Position found
 *       404:
 *         description: Position not found
 */

/**
 * @swagger
 * /api/v1/positions/{id}:
 *   post:
 *     summary: Update a position
 *     tags: [Positions]
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
 *               positionName:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Position updated successfully
 *       404:
 *         description: Position not found
 */

/**
 * @swagger
 * /api/v1/positions/delete/{id}:
 *   post:
 *     summary: Soft delete a position
 *     tags: [Positions]
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
 *         description: Position deleted successfully
 *       404:
 *         description: Position not found
 */
