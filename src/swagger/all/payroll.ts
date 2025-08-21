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

/**
 * @swagger
 * /api/v1/payroll/current-month:
 *   get:
 *     summary: Get current month payrolls for employees in a company
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of current month payroll records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         description: The ID of the payroll record
 *                       status:
 *                         type: string
 *                         enum: [PENDING, APPROVED, PAID, FAILED]
 *                         description: Status of the payroll
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       payrollDefinitionId:
 *                         type: string
 *                         format: uuid
 *                       employeeId:
 *                         type: string
 *                         format: uuid
 *                       basicSalary:
 *                         type: number
 *                         format: decimal
 *                       grossSalary:
 *                         type: number
 *                         format: decimal
 *                       taxableIncome:
 *                         type: number
 *                         format: decimal
 *                       incomeTax:
 *                         type: number
 *                         format: decimal
 *                       totalDeduction:
 *                         type: number
 *                         format: decimal
 *                       totalAllowance:
 *                         type: number
 *                         format: decimal
 *                       netSalary:
 *                         type: number
 *                         format: decimal
 *                       employeePensionAmount:
 *                         type: number
 *                         format: decimal
 *                       employerPensionAmount:
 *                         type: number
 *                         format: decimal
 *       401:
 *         description: Unauthorized - Missing or invalid token
 *       404:
 *         description: Payroll records not found for the current month
 */
