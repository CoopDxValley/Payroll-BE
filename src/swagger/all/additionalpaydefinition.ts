/**
 * @swagger
 * tags:
 *   name: Additional Pay Definitions
 *   description: Manage additional pay definitions
 */

/**
 * @swagger
 * /api/v1/additional-pay-definitions:
 *   post:
 *     summary: Create a new additional pay definition
 *     tags: [Additional Pay Definitions]
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *                 example: NEW
 *               type:
 *                 type: string
 *                 enum: [AMOUNT, PERCENT]
 *                 example: AMOUNT
 *     responses:
 *       201:
 *         description: Additional pay definition created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/additional-pay-definitions:
 *   get:
 *     summary: Get all additional pay definitions
 *     tags: [Additional Pay Definitions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of additional pay definitions
 */

/**
 * @swagger
 * /api/v1/additional-pay-definitions/{id}:
 *   get:
 *     summary: Get an additional pay definition by ID
 *     tags: [Additional Pay Definitions]
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
 *         description: Additional pay definition found
 *       404:
 *         description: Additional pay definition not found
 */

/**
 * @swagger
 * /api/v1/additional-pay-definitions/{id}:
 *   post:
 *     summary: Update an additional pay definition
 *     tags: [Additional Pay Definitions]
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
 *               type:
 *                 type: string
 *                 enum: [AMOUNT, PERCENT]
 *     responses:
 *       200:
 *         description: Additional pay definition updated
 *       404:
 *         description: Additional pay definition not found
 */

/**
 * @swagger
 * /api/v1/additional-pay-definitions/delete/{id}:
 *   post:
 *     summary: Soft delete an additional pay definition
 *     tags: [Additional Pay Definitions]
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
 *         description: Additional pay definition deleted
 *       404:
 *         description: Additional pay definition not found
 */
