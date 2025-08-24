/**
 * @swagger
 * tags:
 *   - name: PayrollDefinition
 *     description: Payroll Definition management
 *
 * components:
 *   schemas:
 *     PayrollDefinition:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         payrollName:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         payPeriod:
 *           type: string
 *         payDate:
 *           type: string
 *           format: date-time
 *         companyId:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     PayrollSummary:
 *       type: object
 *       properties:
 *         payrollDefinition:
 *           $ref: '#/components/schemas/PayrollDefinition'
 *         totalEmployees:
 *           type: integer
 *           description: Total number of employees in the company
 *         processedEmployees:
 *           type: integer
 *           description: Number of employees already included in payroll for the current month
 *         unprocessedEmployees:
 *           type: integer
 *           description: Number of employees not yet included in payroll for the current month
 *
 *     CreatePayrollDefinitionDto:
 *       type: object
 *       required:
 *         - payrollName
 *         - startDate
 *         - endDate
 *         - payPeriod
 *         - payDate
 *       properties:
 *         payrollName:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         payPeriod:
 *           type: string
 *         payDate:
 *           type: string
 *           format: date-time
 *
 *     CreatePayrollDefinitionBulkDto:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/CreatePayrollDefinitionDto'
 *       minItems: 1
 *
 *     UpdatePayrollDefinitionDto:
 *       type: object
 *       properties:
 *         payrollName:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date-time
 *         endDate:
 *           type: string
 *           format: date-time
 *         payPeriod:
 *           type: string
 *         payDate:
 *           type: string
 *           format: date-time
 *
 * /api/v1/payroll-definitions:
 *   get:
 *     summary: Get all payroll definitions
 *     tags: [PayrollDefinition]
 *     responses:
 *       200:
 *         description: List of payroll definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PayrollDefinition'
 *
 *   post:
 *     summary: Create a payroll definition
 *     tags: [PayrollDefinition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayrollDefinitionDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PayrollDefinition'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /api/v1/payroll-definitions/bulk:
 *   post:
 *     summary: Create multiple payroll definitions
 *     tags: [PayrollDefinition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayrollDefinitionBulkDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       400:
 *         description: Bad request (duplicate names)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /api/v1/payroll-definitions/current-year:
 *   get:
 *     summary: Get payroll definitions for the current year
 *     tags: [PayrollDefinition]
 *     responses:
 *       200:
 *         description: Current year payroll definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PayrollDefinition'
 *                 count:
 *                   type: integer
 *
 * /api/v1/payroll-definitions/current-month:
 *   get:
 *     summary: Get payroll definitions for the current month
 *     tags: [PayrollDefinition]
 *     responses:
 *       200:
 *         description: Payroll summary for the current month
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PayrollSummary'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /api/v1/payroll-definitions/latest:
 *   get:
 *     summary: Get the latest payroll definition
 *     tags: [PayrollDefinition]
 *     responses:
 *       200:
 *         description: Latest payroll definition
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PayrollDefinition'
 *
 * /api/v1/payroll-definitions/{id}:
 *   get:
 *     summary: Get payroll definition by ID
 *     tags: [PayrollDefinition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Payroll definition found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PayrollDefinition'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 *   post:
 *     summary: Update payroll definition
 *     tags: [PayrollDefinition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePayrollDefinitionDto'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/PayrollDefinition'
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 * /api/v1/payroll-definitions/remove/{id}:
 *   post:
 *     summary: Delete payroll definition
 *     tags: [PayrollDefinition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
