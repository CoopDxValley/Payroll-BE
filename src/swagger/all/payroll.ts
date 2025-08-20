/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Payroll management
 */

/**
 * @swagger
 * /api/v1/payroll:
 *   post:
 *     summary: Create payroll for employees in a company
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payrollDefinitionId
 *               - employeeIds
 *             properties:
 *               payrollDefinitionId:
 *                 type: string
 *                 format: uuid
 *                 description: The ID of the payroll definition
 *               employeeIds:
 *                 type: array
 *                 description: List of employee IDs to generate payroll for
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Payroll created successfully
 *       400:
 *         description: Bad Request - Validation error, missing employee info, or payroll already exists
 *       404:
 *         description: Payroll definition or employee not found
 */
