/**
 * @swagger
 * tags:
 *   name: Additional Deduction Definitions
 *   description: Manage additional deduction definitions
 */

/**
 * @swagger
 * /api/v1/additional-deduction-definitions:
 *   post:
 *     summary: Create a new additional deduction definition
 *     tags: [Additional Deduction Definitions]
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
 *                 example: PERCENT
 *     responses:
 *       201:
 *         description: Deduction definition created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/additional-deduction-definitions:
 *   get:
 *     summary: Get all additional deduction definitions
 *     tags: [Additional Deduction Definitions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of deduction definitions
 */

/**
 * @swagger
 * /api/v1/additional-deduction-definitions/{id}:
 *   get:
 *     summary: Get a deduction definition by ID
 *     tags: [Additional Deduction Definitions]
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
 *         description: Deduction definition found
 *       404:
 *         description: Deduction definition not found
 */

/**
 * @swagger
 * /api/v1/additional-deduction-definitions/{id}:
 *   post:
 *     summary: Update a deduction definition
 *     tags: [Additional Deduction Definitions]
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
 *         description: Deduction definition updated
 *       404:
 *         description: Deduction definition not found
 */

/**
 * @swagger
 * /api/v1/additional-deduction-definitions/delete/{id}:
 *   post:
 *     summary: Soft delete a deduction definition
 *     tags: [Additional Deduction Definitions]
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
 *         description: Deduction definition deleted
 *       404:
 *         description: Deduction definition not found
 */
