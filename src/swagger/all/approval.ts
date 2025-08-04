/**
 * @swagger
 * tags:
 *   name: Approvals
 *   description: Approval workflow management
 */

/**
 * @swagger
 * /api/v1/approvals/createWorkflow:
 *   post:
 *     summary: Create a new approval workflow
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateApprovalWorkflowDto'
 *     responses:
 *       201:
 *         description: Approval workflow created successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/approvals/createRequest:
 *   post:
 *     summary: Create a new approval request
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRequestDto'
 *     responses:
 *       201:
 *         description: Approval request created successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/approvals/createDelegation:
 *   post:
 *     summary: Create a delegation rule for approvals
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDelegationRuleDto'
 *     responses:
 *       201:
 *         description: Delegation rule created successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/approvals/action:
 *   post:
 *     summary: Take action on an approval request
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApprovalDto'
 *     responses:
 *       200:
 *         description: Action taken successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/approvals/resubmit/{instanceId}:
 *   post:
 *     summary: Resubmit an approval request
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: instanceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Instance ID of the approval request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResubmitApprovalDto'
 *     responses:
 *       200:
 *         description: Approval request resubmitted successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/approvals/audit-log:
 *   get:
 *     summary: Get approval audit logs
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ...
 *         schema:
 *           type: string
 *         description: Audit log query parameters
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/approvals/instance/{id}:
 *   get:
 *     summary: Get approval instance details
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Instance ID
 *     responses:
 *       200:
 *         description: Instance details retrieved successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateApprovalWorkflowDto:
 *       type: object
 *       required:
 *         - name
 *         - requestType
 *         - isFullyParallel
 *         - stages
 *       properties:
 *         name:
 *           type: string
 *         departmentId:
 *           type: string
 *           format: uuid
 *         requestType:
 *           type: string
 *           enum: [ATTENDANCE, EXPENSE, PAYROLL, PROGRAM]
 *         isFullyParallel:
 *           type: boolean
 *         stages:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - isParallel
 *               - order
 *               - approvalRules
 *               - employeeIds
 *             properties:
 *               isParallel:
 *                 type: boolean
 *               order:
 *                 type: integer
 *               approvalRules:
 *                 oneOf:
 *                   - $ref: '#/components/schemas/AllOrAnyNRuleSchema'
 *                   - $ref: '#/components/schemas/WeightedRuleSchema'
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid

 *     AllOrAnyNRuleSchema:
 *       type: object
 *       required:
 *         - type
 *         - required
 *       properties:
 *         type:
 *           type: string
 *           enum: [all, anyN]
 *         required:
 *           type: integer
 *           minimum: 1

 *     WeightedRuleSchema:
 *       type: object
 *       required:
 *         - type
 *         - threshold
 *         - weights
 *       properties:
 *         type:
 *           type: string
 *           enum: [weighted]
 *         threshold:
 *           type: integer
 *           minimum: 1
 *         weights:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *             minimum: 1

 *     CreateRequestDto:
 *       type: object
 *       required:
 *         - requestType
 *         - moduleId
 *       properties:
 *         requestType:
 *           type: string
 *           enum: [ATTENDANCE, EXPENSE, PAYROLL, PROGRAM]
 *         moduleId:
 *           type: string
 *           format: uuid

 *     CreateDelegationRuleDto:
 *       type: object
 *       required:
 *         - requestType
 *         - fromEmployeeId
 *         - toEmployeeId
 *       properties:
 *         requestType:
 *           type: string
 *           enum: [ATTENDANCE, EXPENSE, PAYROLL, PROGRAM]
 *         fromEmployeeId:
 *           type: string
 *           format: uuid
 *         toEmployeeId:
 *           type: string
 *           format: uuid

 *     ApprovalDto:
 *       type: object
 *       required:
 *         - instanceId
 *         - action
 *         - stageId
 *       properties:
 *         instanceId:
 *           type: string
 *           format: uuid
 *         action:
 *           type: string
 *           enum: [APPROVED, REJECTED]
 *         comment:
 *           type: string
 *         stageId:
 *           type: string
 *           format: uuid

 *     ResubmitApprovalDto:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 */
