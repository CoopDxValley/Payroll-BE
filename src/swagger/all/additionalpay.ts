/**
 * @swagger
 * tags:
 *   - name: Additional Pay
 *     description: Additional Pay management
 *
 * components:
 *   schemas:
 *     Additional Pay:
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
 *         additionalPayDefinitionId:
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
 *     CreateAdditionalPayDto:
 *       type: object
 *       required: [name, amount, employeeId]
 *       properties:
 *         amount:
 *           type: number
 *         employeeId:
 *           type: string
 *           format: uuid
 *         additionalPayDefinitionId:
 *           type: string
 *           format: uuid
 *     UpdateAdditionalPayDto:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *         employeeId:
 *           type: string
 *           format: uuid
 *         additionalPayDefinitionId:
 *           type: string
 *           format: uuid
 * /api/v1/additional-pay:
 *   get:
 *     summary: Get all additional pays
 *     tags: [Additional Pay]
 *     responses:
 *       200:
 *         description: List of additional pays
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Additional Pay'
 *   post:
 *     summary: Create additional pay
 *     tags: [Additional Pay]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdditionalPayDto'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Additional Pay'
 *
 * /api/v1/additional-pay/{id}:
 *   get:
 *     summary: Get additional pay by ID
 *     tags: [Additional Pay]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *     responses:
 *       200:
 *         description: Additional pay found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Additional Pay'
 *   post:
 *     summary: Update additional pay
 *     tags: [Additional Pay]
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
 *             $ref: '#/components/schemas/UpdateAdditionalPayDto'
 *     responses:
 *       200:
 *         description: Updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Additional Pay'
 *
 * /api/v1/additional-pay/remove/{id}:
 *   post:
 *     summary: Delete additional pay
 *     tags: [Additional Pay]
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
 */
