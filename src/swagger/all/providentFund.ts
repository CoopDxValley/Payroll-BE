/**
 * @swagger
 * tags:
 *   name: ProvidentFund
 *   description: Provident Fund management
 */

/**
 * @swagger
 * /api/v1/provident-fund:
 *   post:
 *     summary: Create a new provident fund
 *     tags: [ProvidentFund]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               employeeContribution:
 *                 type: number
 *                 example: 7
 *               employerContribution:
 *                 type: number
 *                 example: 11
 *     responses:
 *       201:
 *         description: Provident fund created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 companyId:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 providentFundId:
 *                   type: string
 *       400:
 *         description: Bad Request - Validation Error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/provident-fund:
 *   get:
 *     summary: Get provident funds for the authenticated company
 *     tags: [ProvidentFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provident funds for the company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 providentFunds:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProvidentFund'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/provident-fund/default:
 *   get:
 *     summary: Get default provident funds
 *     tags: [ProvidentFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all default provident funds
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProvidentFund'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/provident-fund/{ruleId}:
 *   post:
 *     summary: remove a specific provident fund rule by ID
 *     tags: [ProvidentFund]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ruleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the provident fund rule to remove
 *     responses:
 *       200:
 *         description: Provident fund rule removed successfully
 *       400:
 *         description: Invalid rule ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Provident fund rule not found
 */

/**
 * @swagger
 * /api/v1/provident-fund/reset:
 *   post:
 *     summary: Reset the company's provident fund rules to default
 *     tags: [ProvidentFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Provident fund rules reset successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/provident-fund/assign/default:
 *   post:
 *     summary: assign default provident fund rules to the company
 *     tags: [ProvidentFund]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default provident fund rules applied
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ProvidentFund:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         companyId:
 *           type: string
 *         employerContribution:
 *           type: number
 *         employeeContribution:
 *           type: number
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
