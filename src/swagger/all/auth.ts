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
 *                 example: biruk
 *               password:
 *                 type: string
 *                 example: SuperSecurePassword@123
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

/**
 * @swagger
 * /api/v1/auth/resetPassword:
 *   post:
 *     summary: User reset password
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
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: strongpassword123
 *     responses:
 *       200:
 *         description: Successful reset password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid username or password
 */

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user and invalidate refresh token
 *     tags: [Authorization]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: your-refresh-token-here
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       400:
 *         description: Refresh token is missing or invalid
 */

/**
 * @swagger
 * /api/v1/auth/forgotPassword:
 *   post:
 *     summary: Send password reset instructions to the user
 *     tags: [Authorization]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *     responses:
 *       200:
 *         description: Password reset link sent if user exists
 *       404:
 *         description: User not found
 */
