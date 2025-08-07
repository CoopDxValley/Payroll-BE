/**
 * @swagger
 * tags:
 *   - name: Allowance
 *     description: Allowance management
 *
 * components:
 *   schemas:
 *     Allowance:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         amount:
 *           type: string
 *         allowanceDefinitionId:
 *           type: string
 *           format: uuid
 *         gradeId:
 *           type: string
 *           format: uuid
 *         companyId:
 *           type: string
 *           format: uuid
 *     CreateAllowanceDto:
 *       type: object
 *       required: [amount, allowanceDefinitionId, gradeId, companyId]
 *       properties:
 *         amount:
 *           type: string
 *         allowanceDefinitionId:
 *           type: string
 *           format: uuid
 *         gradeId:
 *           type: string
 *           format: uuid
 *     UpdateAllowanceDto:
 *       type: object
 *       properties:
 *         amount:
 *           type: string
 *         allowanceDefinitionId:
 *           type: string
 *           format: uuid
 *         gradeId:
 *           type: string
 *           format: uuid
 *
 * /api/v1/allowances:
 *   get:
 *     summary: Get all allowances
 *     tags: [Allowance]
 *     responses:
 *       200:
 *         description: List of allowances
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Allowance'
 *                 message:
 *                   type: string
 *   post:
 *     summary: Create allowance
 *     tags: [Allowance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAllowanceDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Allowance'
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
 * /api/v1/allowances/{id}:
 *   get:
 *     summary: Get allowance by ID
 *     tags: [Allowance]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Allowance found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Allowance'
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
 *     summary: Update allowance
 *     tags: [Allowance]
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
 *             $ref: '#/components/schemas/UpdateAllowanceDto'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Allowance'
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
 * /api/v1/allowances/remove/{id}:
 *   post:
 *     summary: Delete allowance
 *     tags: [Allowance]
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
