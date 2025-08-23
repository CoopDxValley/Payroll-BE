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

/**
 * @swagger
 * /api/v1/payroll/definition/{id}:
 *   get:
 *     summary: Get payrolls by payroll definition ID
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: List of payroll records for the specified payroll definition ID
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

/**
 * @swagger
 * /api/v1/payroll/payroll-setup:
 *   get:
 *     summary: Get payroll setup summary
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll setup summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 processed:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 15
 *                       description: Number of processed payrolls
 *                     totalAmount:
 *                       type: number
 *                       format: float
 *                       example: 150000.50
 *                       description: Total processed payroll amount
 *                 unprocessed:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *                       example: 5
 *                       description: Number of unprocessed payrolls
 *                     totalAmount:
 *                       type: number
 *                       format: float
 *                       example: 50000.00
 *                       description: Total unprocessed payroll amount
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: Payroll setup data not found
 */

/**
 * @swagger
 * /api/v1/payroll/process/payments:
 *   get:
 *     summary: Get payroll payment details for employees
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payroll payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   employee:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "d290f1ee-6c54-4b01-90e6-d701748f0851"
 *                         description: Employee ID
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                         description: Employee full name
 *                       payrollInfo:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           basicSalary:
 *                             type: number
 *                             format: float
 *                             example: 12000.75
 *                             description: Basic salary of employee
 *                           tinNumber:
 *                             type: string
 *                             example: "TIN1234567"
 *                             description: Tax Identification Number
 *                           employmentType:
 *                             type: string
 *                             enum: [FULL_TIME, PART_TIME, CONTRACT, INTERN]
 *                             example: FULL_TIME
 *                       gradeHistory:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             grade:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Grade A"
 *                   grossSalary:
 *                     type: number
 *                     format: float
 *                     example: 15000.00
 *                   taxableIncome:
 *                     type: number
 *                     format: float
 *                     example: 12000.00
 *                   totalDeduction:
 *                     type: number
 *                     format: float
 *                     example: 2000.00
 *                   totalAllowance:
 *                     type: number
 *                     format: float
 *                     example: 1000.00
 *                   netSalary:
 *                     type: number
 *                     format: float
 *                     example: 13000.00
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: No payroll payments found for employees
 */
