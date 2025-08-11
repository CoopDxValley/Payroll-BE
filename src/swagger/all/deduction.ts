/**
 * @swagger
 * tags:
 *   - name: Deduction
 *     description: Deduction management
 *
 * components:
 *   schemas:
 *     Deduction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: string
 *         deductionDefinitionId:
 *           type: string
 *           format: uuid
 *         gradeId:
 *           type: string
 *           format: uuid
 *         companyId:
 *           type: string
 *           format: uuid
 *     CreateDeductionDto:
 *       type: object
 *       required: [amount, deductionDefinitionId, gradeId, companyId]
 *       properties:
 *         amount:
 *           type: string
 *         deductionDefinitionId:
 *           type: string
 *           format: uuid
 *         gradeId:
 *           type: string
 *           format: uuid
 *     UpdateDeductionDto:
 *       type: object
 *       properties:
 *         amount:
 *           type: string
 *         deductionDefinitionId:
 *           type: string
 *           format: uuid
 *         gradeId:
 *           type: string
 *           format: uuid
 *
 * /api/v1/deductions:
 *   get:
 *     summary: Get all deductions
 *     tags: [Deduction]
 *     responses:
 *       200:
 *         description: List of deductions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Deduction'
 *                 message:
 *                   type: string
 *   post:
 *     summary: Create deduction
 *     tags: [Deduction]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeductionDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Deduction'
 *                 message:
 *                   type: string
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
 * /api/v1/deductions/{id}:
 *   get:
 *     summary: Get deduction by ID
 *     tags: [Deduction]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Deduction found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Deduction'
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
 *     summary: Update deduction
 *     tags: [Deduction]
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
 *             $ref: '#/components/schemas/UpdateDeductionDto'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Deduction'
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
 * /api/v1/deductions/remove/{id}:
 *   post:
 *     summary: Delete deduction
 *     tags: [Deduction]
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
