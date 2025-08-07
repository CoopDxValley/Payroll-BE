/**
 * @swagger
 * tags:
 *   name: Pension
 *   description: Pension management
 */

/**
 * @swagger
 * /api/v1/pension:
 *   post:
 *     summary: Create a new pension
 *     tags: [Pension]
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
 *         description: Pension created successfully
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
 *                 pensionId:
 *                   type: string
 *       400:
 *         description: Bad Request - Validation Error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/pension:
 *   get:
 *     summary: Get pensions for the authenticated company
 *     tags: [Pension]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pensions for the company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pensions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Pension'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/pension/default:
 *   get:
 *     summary: Get default pensions
 *     tags: [Pension]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all default pensions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pension'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/pension/{ruleId}:
 *   post:
 *     summary: remove a specific pension rule by ID
 *     tags: [Pension]
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
 *         description: Pension rule removed successfully
 *       400:
 *         description: Invalid rule ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Pension rule not found
 */

/**
 * @swagger
 * /api/v1/pension/reset:
 *   post:
 *     summary: Reset the company's pension rules to default
 *     tags: [Pension]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pension rules reset successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/pension/assign/default:
 *   post:
 *     summary: assign default pension rules to the company
 *     tags: [Pension]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default pension rules applied
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Pension:
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
