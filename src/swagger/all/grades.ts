/**
 * @swagger
 * tags:
 *   name: Grades
 *   description: Grade management
 */

/**
 * @swagger
 * /api/v1/grades:
 *   post:
 *     summary: Create a new grade
 *     tags: [Grades]
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
 *               - minSalary
 *               - maxSalary
 *             properties:
 *               name:
 *                 type: string
 *               minSalary:
 *                 type: number
 *               maxSalary:
 *                 type: number
 *     responses:
 *       201:
 *         description: Grade created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/grades:
 *   get:
 *     summary: Get all grades for the company
 *     tags: [Grades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of grades
 */

/**
 * @swagger
 * /api/v1/grades/{id}:
 *   get:
 *     summary: Get a grade by ID
 *     tags: [Grades]
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
 *         description: Grade found
 *       404:
 *         description: Grade not found
 */

/**
 * @swagger
 * /api/v1/grades/{id}:
 *   post:
 *     summary: Update a grade
 *     tags: [Grades]
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
 *               minSalary:
 *                 type: number
 *               maxSalary:
 *                 type: number
 *     responses:
 *       200:
 *         description: Grade updated
 */

/**
 * @swagger
 * /api/v1/grades/delete/{id}:
 *   post:
 *     summary: Soft delete a grade
 *     tags: [Grades]
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
 *         description: Grade deleted
 */
