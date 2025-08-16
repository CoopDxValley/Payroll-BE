/**
 * @swagger
 * tags:
 *   name: IdFormats
 *   description: Company Id format management
 */

/**
 * @swagger
 * /api/v1/idformats:
 *   post:
 *     summary: Create a new IdFormat for the authenticated company
 *     tags: [IdFormats]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order
 *             properties:
 *               companyCode:
 *                 type: boolean
 *               year:
 *                 type: boolean
 *               department:
 *                 type: boolean
 *               separator:
 *                 type: string
 *                 enum: ["/", "-"]
 *                 default: "/"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *               digitLength:
 *                 type: integer
 *                 default: 5
 *               order:
 *                 type: string
 *                 example: "companyCode,year,department"
 *     responses:
 *       201:
 *         description: IdFormat created successfully
 *       400:
 *         description: Bad Request - Validation error or already exists
 *       503:
 *         description: Service unavailable
 */

/**
 * @swagger
 * /api/v1/idformats:
 *   get:
 *     summary: Get all IdFormats for the authenticated company
 *     tags: [IdFormats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of IdFormats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/IdFormat'
 *       503:
 *         description: Service unavailable
 */

/**
 * @swagger
 * /api/v1/idformats/active:
 *   get:
 *     summary: Get the active IdFormat for the authenticated company
 *     tags: [IdFormats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active IdFormat
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IdFormat'
 *       404:
 *         description: Active IdFormat not found
 *       503:
 *         description: Service unavailable
 */

/**
 * @swagger
 * /api/v1/idformats/{id}:
 *   post:
 *     summary: Update an existing IdFormat
 *     tags: [IdFormats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: IdFormat ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyCode:
 *                 type: boolean
 *               year:
 *                 type: boolean
 *               department:
 *                 type: boolean
 *               separator:
 *                 type: string
 *                 enum: ["/", "-"]
 *               isActive:
 *                 type: boolean
 *               digitLength:
 *                 type: integer
 *               order:
 *                 type: string
 *     responses:
 *       200:
 *         description: IdFormat updated successfully
 *       404:
 *         description: IdFormat not found
 *       503:
 *         description: Service unavailable
 */

/**
 * @swagger
 * /api/v1/idformats/remove/{id}:
 *   post:
 *     summary: Delete an IdFormat
 *     tags: [IdFormats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: IdFormat ID
 *     responses:
 *       200:
 *         description: IdFormat deleted successfully
 *       404:
 *         description: IdFormat not found
 *       503:
 *         description: Service unavailable
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IdFormat:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         companyCode:
 *           type: boolean
 *         year:
 *           type: boolean
 *         department:
 *           type: boolean
 *         separator:
 *           type: string
 *           enum: ["/", "-"]
 *         isActive:
 *           type: boolean
 *         digitLength:
 *           type: integer
 *         order:
 *           type: string
 *         companyId:
 *           type: string
 *           format: uuid
 */
