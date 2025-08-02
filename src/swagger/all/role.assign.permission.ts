/**
 * @swagger
 * /api/v1/roles/assign/permission/{roleId}:
 *   post:
 *     summary: Assign permissions to a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignPermissionsToRoleInput'
 *     responses:
 *       200:
 *         description: Permissions assigned to role successfully
 *       400:
 *         description: Bad Request - Validation Error
 */
