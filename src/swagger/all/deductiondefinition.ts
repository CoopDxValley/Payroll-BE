/**
 * @swagger
 * tags:
 *   - name: DeductionDefinition
 *     description: Deduction Definition management
 *
 * components:
 *   schemas:
 *     DeductionDefinition:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         companyId:
 *           type: string
 *           format: uuid
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateDeductionDefinitionDto:
 *       type: object
 *       required: [name, companyId]
 *       properties:
 *         name:
 *           type: string
 *     UpdateDeductionDefinitionDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         isActive:
 *           type: boolean
 *
 * /api/v1/deduction-definitions:
 *   get:
 *     summary: Get all deduction definitions
 *     tags: [DeductionDefinition]
 *     responses:
 *       200:
 *         description: List of deduction definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DeductionDefinition'
 *                 message:
 *                   type: string
 *   post:
 *     summary: Create deduction definition
 *     tags: [DeductionDefinition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDeductionDefinitionDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeductionDefinition'
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
 * /api/v1/deduction-definitions/{id}:
 *   get:
 *     summary: Get deduction definition by ID
 *     tags: [DeductionDefinition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Deduction definition found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeductionDefinition'
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
 *     summary: Update deduction definition
 *     tags: [DeductionDefinition]
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
 *             $ref: '#/components/schemas/UpdateDeductionDefinitionDto'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/DeductionDefinition'
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
 * /api/v1/deduction-definitions/remove/{id}:
 *   post:
 *     summary: Delete deduction definition
 *     tags: [DeductionDefinition]
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
