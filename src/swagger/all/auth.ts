/**
 * @swagger
 * tags:
 *   name: Authorization
 *   description: User authentication
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Login and obtain a JWT token
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: IT-head
 *               password:
 *                 type: string
 *                 example: SuperSecurePassword123
 *     responses:
 *       200:
 *         description: Successful login, returns JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 1
 *                     username:
 *                       type: string
 *                       example: IT-head
 *       401:
 *         description: Unauthorized - Invalid credentials
 */
