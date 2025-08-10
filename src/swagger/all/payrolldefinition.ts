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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PayrollDefinition'
 *                 message:
 *                   type: string
 *             examples:
 *               success:
 *                 value:
 *                   message: Fetched successfully
 *                   data:
 *                     - id: "7a6b8c4d-1c2b-4a5f-9d10-1234567890ab"
 *                       payrollName: "January 2025"
 *                       startDate: "2025-01-01T00:00:00.000Z"
 *                       endDate: "2025-01-31T23:59:59.999Z"
 *                       payPeriod: "MONTHLY"
 *                       payDate: "2025-02-01T00:00:00.000Z"
 *                       companyId: "11111111-2222-3333-4444-555555555555"
 *   post:
 *     summary: Create a payroll definition
 *     tags: [PayrollDefinition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePayrollDefinitionDto'
 *           examples:
 *             sample:
 *               value:
 *                 payrollName: "February 2025"
 *                 startDate: "2025-02-01T00:00:00.000Z"
 *                 endDate: "2025-02-28T23:59:59.999Z"
 *                 payPeriod: "MONTHLY"
 *                 payDate: "2025-03-01T00:00:00.000Z"
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PayrollDefinition'
 *                 message:
 *                   type: string
 *             examples:
 *               success:
 *                 value:
 *                   message: Created
 *                   data:
 *                     id: "9b7f6e5d-4c3b-2a1f-0e9d-876543210abc"
 *                     payrollName: "February 2025"
 *                     startDate: "2025-02-01T00:00:00.000Z"
 *                     endDate: "2025-02-28T23:59:59.999Z"
 *                     payPeriod: "MONTHLY"
 *                     payDate: "2025-03-01T00:00:00.000Z"
 *                     companyId: "11111111-2222-3333-4444-555555555555"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               duplicateName:
 *                 value:
 *                   message: Payroll name already exists for this company
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
 *           examples:
 *             sample:
 *               value:
 *                 - payrollName: "March 2025"
 *                   startDate: "2025-03-01T00:00:00.000Z"
 *                   endDate: "2025-03-31T23:59:59.999Z"
 *                   payPeriod: "MONTHLY"
 *                   payDate: "2025-04-01T00:00:00.000Z"
 *                 - payrollName: "April 2025"
 *                   startDate: "2025-04-01T00:00:00.000Z"
 *                   endDate: "2025-04-30T23:59:59.999Z"
 *                   payPeriod: "MONTHLY"
 *                   payDate: "2025-05-01T00:00:00.000Z"
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
 *             examples:
 *               success:
 *                 value:
 *                   message: Successfully defined your payroll.
 *                   data:
 *                     count: 2
 *       400:
 *         description: Bad request (duplicate names)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               duplicateNames:
 *                 value:
 *                   message: "Payroll names already exist for the company: March 2025"
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PayrollDefinition'
 *                 count:
 *                   type: integer
 *                 message:
 *                   type: string
 *
 * /api/v1/payroll-definitions/current-month:
 *   get:
 *     summary: Get payroll definitions for the current month
 *     tags: [PayrollDefinition]
 *     responses:
 *       200:
 *         description: Current month payroll definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PayrollDefinition'
 *                 count:
 *                   type: integer
 *                 message:
 *                   type: string
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               notDefined:
 *                 value:
 *                   message: Payroll not defined for this month
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
 *           examples:
 *             sample:
 *               value:
 *                 payrollName: "April 2025"
 *                 startDate: "2025-04-01T00:00:00.000Z"
 *                 endDate: "2025-04-30T23:59:59.999Z"
 *                 payPeriod: "MONTHLY"
 *                 payDate: "2025-05-01T00:00:00.000Z"
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/PayrollDefinition'
 *                 message:
 *                   type: string
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
 *             examples:
 *               success:
 *                 value:
 *                   message: Deleted
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
