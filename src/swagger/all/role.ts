/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management and permissions
 */

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRoleInput'
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Bad Request - Validation Error
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */

/**
 * @swagger
 * /api/v1/roles/{roleId}:
 *   get:
 *     summary: Get role details by Id
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
 *     responses:
 *       200:
 *         description: Role Retrived Successfully
 *       400:
 *         description: Bad Request - Validation Error
 *   post:
 *     summary: Update a role
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
 *             $ref: '#/components/schemas/UpdateRoleInput'
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/roles/create-role-with-permission:
 *   post:
 *     summary: Create a role and assign permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAssignPermissionToRolesInput'
 *     responses:
 *       201:
 *         description: Role and permissions created successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/roles/update-role-permissions/{roleId}:
 *   post:
 *     summary: Update permissions for a role
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
 *         description: Role permissions updated successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/roles/assign-role-to-employee:
 *   post:
 *     summary: Assign a role to an employee
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignRoleToEmployeeInput'
 *     responses:
 *       200:
 *         description: Role assigned to employee successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/roles/revoke-role-from-employee:
 *   post:
 *     summary: Revoke a role from an employee
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignRoleToEmployeeInput'
 *     responses:
 *       200:
 *         description: Role revoked from employee successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/roles/remove-role/{roleId}:
 *   post:
 *     summary: Remove a role
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
 *             $ref: '#/components/schemas/RemoveRoleInput'
 *     responses:
 *       200:
 *         description: Role removed successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *     CreateRoleInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *     UpdateRoleInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *     AssignPermissionsToRoleInput:
 *       type: object
 *       required:
 *         - permissions
 *       properties:
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *     CreateAssignPermissionToRolesInput:
 *       type: object
 *       required:
 *         - name
 *         - permissions
 *       properties:
 *         name:
 *           type: string
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *     AssignRoleToEmployeeInput:
 *       type: object
 *       required:
 *         - roleId
 *         - employeeId
 *       properties:
 *         roleId:
 *           type: string
 *         employeeId:
 *           type: string
 *     RemoveRoleInput:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: string
 */
