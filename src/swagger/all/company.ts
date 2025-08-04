/**
 * @swagger
 * tags:
 *   name: Company
 *   description: Company onboarding and Management
 */

/**
 * @swagger
 * /api/v1/company/register:
 *   post:
 *     summary: Create a new company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - organizationName
 *               - phoneNumber
 *               - companyCode
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: company@example.com
 *               organizationName:
 *                 type: string
 *                 example: My Company Ltd
 *               phoneNumber:
 *                 type: string
 *                 example: "0912345678"
 *               companyCode:
 *                 type: string
 *                 example: CMP001
 *               notes:
 *                 type: string
 *                 example: Optional internal notes about the company
 *     responses:
 *       201:
 *         description: Company created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, INACTIVE, PENDING, SUSPENDED]
 *                 organizationName:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 companyCode:
 *                   type: string
 *                 email:
 *                   type: string
 *                   nullable: true
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /api/v1/company/profile:
 *   get:
 *     summary: Get authenticated user's company
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company data retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, INACTIVE, PENDING, SUSPENDED]
 *                 organizationName:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 companyCode:
 *                   type: string
 *                 email:
 *                   type: string
 *                   nullable: true
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/v1/company/update:
 *   patch:
 *     summary: Update existing company information
 *     tags: [Company]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@example.com
 *               organizationName:
 *                 type: string
 *                 example: Updated Company Name
 *               phoneNumber:
 *                 type: string
 *                 example: "+251911234567"
 *               companyCode:
 *                 type: string
 *                 example: NEWCMP001
 *               notes:
 *                 type: string
 *                 example: Updated company notes
 *     responses:
 *       200:
 *         description: Company updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [ACTIVE, INACTIVE, PENDING, SUSPENDED]
 *                 organizationName:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 companyCode:
 *                   type: string
 *                 email:
 *                   type: string
 *                   nullable: true
 *                 notes:
 *                   type: string
 *                   nullable: true
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
