/**
 * @swagger
 * tags:
 *   - name: AllowanceDefinition
 *     description: Allowance Definition management
 *
 * components:
 *   schemas:
 *     AllowanceDefinition:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         isTaxable:
 *           type: boolean
 *         isExempted:
 *           type: boolean
 *         exemptedAmount:
 *           type: number
 *         startingAmount:
 *           type: number
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
 *     CreateAllowanceDefinitionDto:
 *       type: object
 *       required: [name, companyId]
 *       properties:
 *         name:
 *           type: string
 *         isTaxable:
 *           type: boolean
 *         isExempted:
 *           type: boolean
 *         exemptedAmount:
 *           type: number
 *         startingAmount:
 *           type: number
 *     UpdateAllowanceDefinitionDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         isTaxable:
 *           type: boolean
 *         isExempted:
 *           type: boolean
 *         exemptedAmount:
 *           type: amount
 *         startingAmount:
 *           type: amount
 *
 * /api/v1/allowance-definitions:
 *   get:
 *     summary: Get all allowance definitions
 *     tags: [AllowanceDefinition]
 *     responses:
 *       200:
 *         description: List of allowance definitions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AllowanceDefinition'
 *                 message:
 *                   type: string
 *   post:
 *     summary: Create allowance definition
 *     tags: [AllowanceDefinition]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAllowanceDefinitionDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AllowanceDefinition'
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
 * /api/v1/allowance-definitions/{id}:
 *   get:
 *     summary: Get allowance definition by ID
 *     tags: [AllowanceDefinition]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Allowance definition found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AllowanceDefinition'
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
 *     summary: Update allowance definition
 *     tags: [AllowanceDefinition]
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
 *             $ref: '#/components/schemas/UpdateAllowanceDefinitionDto'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AllowanceDefinition'
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
 * /api/v1/allowance-definitions/remove/{id}:
 *   post:
 *     summary: Delete allowance definition
 *     tags: [AllowanceDefinition]
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
