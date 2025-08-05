/**
 * @swagger
 * tags:
 *   name: TaxSlab
 *   description: Tax slab management
 */

/**
 * @swagger
 * /api/v1/taxslab:
 *   post:
 *     summary: Create a new tax slab
 *     tags: [TaxSlab]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Income Tax Level 1
 *               description:
 *                 type: string
 *                 example: Applies to low-income earners
 *               type:
 *                 type: string
 *                 enum: [INCOME_TAX, EXEMPTION]
 *                 default: INCOME_TAX
 *               rate:
 *                 type: number
 *                 example: 0.1
 *               deductible:
 *                 type: number
 *                 example: 200
 *               minIncome:
 *                 type: number
 *                 example: 0
 *               maxIncome:
 *                 type: number
 *                 example: 600
 *     responses:
 *       201:
 *         description: Tax slab created successfully
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
 *                 taxSlabId:
 *                   type: string
 *                 providentFundId:
 *                   type: string
 *                   nullable: true
 *       400:
 *         description: Bad Request - Validation Error
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/taxslab:
 *   get:
 *     summary: Get tax slabs for the authenticated company
 *     tags: [TaxSlab]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tax slabs for the company
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slabs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaxSlab'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/taxslab/default:
 *   get:
 *     summary: Get default tax slabs
 *     tags: [TaxSlab]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all tax slabs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/TaxSlab'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/taxslab/{ruleId}:
 *   post:
 *     summary: remove a specific tax slab rule by ID
 *     tags: [TaxSlab]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ruleId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the tax slab rule to remove
 *     responses:
 *       200:
 *         description: Tax slab rule removed successfully
 *       400:
 *         description: Invalid rule ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Tax slab rule not found
 */

/**
 * @swagger
 * /api/v1/taxslab/reset:
 *   post:
 *     summary: Reset the company's tax slab rules to default
 *     tags: [TaxSlab]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tax slab rules reset successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/taxslab/assign/default:
 *   post:
 *     summary: assign default tax slab rules to the company
 *     tags: [TaxSlab]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default tax slab rules applied
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TaxSlab:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         companyId:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         type:
 *           type: string
 *           enum: [INCOME_TAX, EXEMPTION]
 *         rate:
 *           type: number
 *         deductible:
 *           type: number
 *         minIncome:
 *           type: number
 *         maxIncome:
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
