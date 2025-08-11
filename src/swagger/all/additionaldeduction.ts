/**
 * @swagger
 * tags:
 *   - name: Additional Deduction
 *     description: Additional Deduction management
 *
 * components:
 *   schemas:
 *     Additional Deduction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: number
 *         employeeId:
 *           type: string
 *           format: uuid
 *         additionalDeductionDefinitionId:
 *           type: string
 *           format: uuid
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
 *     CreateAdditionalDeductionDto:
 *       type: object
 *       required:
 *         - amount
 *         - employeeId
 *       properties:
 *         amount:
 *           type: number
 *         employeeId:
 *           type: string
 *           format: uuid
 *         additionalDeductionDefinitionId:
 *           type: string
 *           format: uuid
 *
 *     UpdateAdditionalDeductionDto:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *
 * /api/v1/additional-deduction:
 *   get:
 *     summary: Get all additional deductions
 *     tags: [Additional Deduction]
 *     responses:
 *       200:
 *         description: List of additional deductions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Additional Deduction'
 *
 *   post:
 *     summary: Create additional deduction
 *     tags: [Additional Deduction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdditionalDeductionDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Additional Deduction'
 *
 * /api/v1/additional-deduction/{id}:
 *   get:
 *     summary: Get additional deduction by ID
 *     tags: [Additional Deduction]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Additional deduction found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Additional Deduction'
 *
 *   post:
 *     summary: Update additional deduction
 *     tags: [Additional Deduction]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAdditionalDeductionDto'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Additional Deduction'
 *
 * /api/v1/additional-deduction/remove/{id}:
 *   post:
 *     summary: Delete additional deduction
 *     tags: [Additional Deduction]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Deleted
 */
