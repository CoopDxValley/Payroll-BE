/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee onboarding and management
 */

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Onboard a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - personalInfo
 *               - payrollInfo
 *               - emergencyContacts
 *             properties:
 *               personalInfo:
 *                 type: object
 *                 required:
 *                   - name
 *                   - phoneNumber
 *                   - password
 *                   - gender
 *                 properties:
 *                   name:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   optionalPhoneNumber:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   employeeIdNumber:
 *                     type: string
 *                   deviceUserId:
 *                     type: string
 *                   gender:
 *                     type: string
 *                     enum: [MALE, FEMALE]
 *                   country:
 *                     type: string
 *                     default: Ethiopia
 *                   zone:
 *                     type: string
 *                   woreda:
 *                     type: string
 *                   kebele:
 *                     type: string
 *                   region:
 *                     type: string
 *                   houseNo:
 *                     type: string
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                   nationality:
 *                     type: string
 *                     default: Ethiopia
 *                   maritalStatus:
 *                     type: string
 *                     enum: [SINGLE, MARRIED, DIVORCED, WIDOWED]
 *                   title:
 *                     type: string
 *                   imageUrl:
 *                     type: string
 *                     format: uri
 *                   status:
 *                     type: string
 *                     enum: [ACTIVE, INACTIVE, TERMINATED, ON_LEAVE, RETIRED]
 *                   idNumber:
 *                     type: string
 *                   idImageUrl:
 *                     type: string
 *                     format: uri
 *                   idType:
 *                     type: string
 *                     enum: [NATIONALID, PASSPORT, LICENSE, KEBELE]
 *               payrollInfo:
 *                 type: object
 *                 required:
 *                   - tinNumber
 *                   - hireDate
 *                   - basicSalary
 *                   - employmentType
 *                   - accountNumber
 *                   - positionId
 *                   - departmentId
 *                   - gradeId
 *                 properties:
 *                   tinNumber:
 *                     type: string
 *                   hireDate:
 *                     type: string
 *                     format: date
 *                   basicSalary:
 *                     type: number
 *                     format: float
 *                   currency:
 *                     type: string
 *                     default: ETB
 *                   employmentType:
 *                     type: string
 *                     enum: [CONTRACT, HOURLY, PERMANENT]
 *                   payFrequency:
 *                     type: string
 *                     enum: [MONTHLY, BIWEEKLY, WEEKLY, DAILY]
 *                     default: MONTHLY
 *                   accountNumber:
 *                     type: string
 *                   positionId:
 *                     type: string
 *                     format: uuid
 *                   departmentId:
 *                     type: string
 *                     format: uuid
 *                   gradeId:
 *                     type: string
 *                     format: uuid
 *               emergencyContacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - fullName
 *                     - relationship
 *                     - phone
 *                   properties:
 *                     fullName:
 *                       type: string
 *                     relationship:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                       format: email
 *                     address:
 *                       type: string
 *     responses:
 *       201:
 *         description: Employee onboarded successfully
 *       400:
 *         description: Bad Request - Validation Error
 */

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: Get a list of employees
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by (e.g., name, createdAt)
 *       - in: query
 *         name: sortType
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort direction
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Number of employees per page (default is 10)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number (default is 1)
 *     responses:
 *       200:
 *         description: A list of employees with pagination metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 employees:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       gender:
 *                         type: string
 *                         enum: [MALE, FEMALE]
 *                       employeeIdNumber:
 *                         type: string
 *                       positionHistory:
 *                         type: object
 *                         properties:
 *                           position:
 *                             type: object
 *                             properties:
 *                               positionName:
 *                                 type: string
 *                       gradeHistory:
 *                         type: object
 *                         properties:
 *                           grade:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Bad Request - Invalid query parameters
 */

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     summary: Get employee info by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Employee ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Employee information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 gender:
 *                   type: string
 *                   enum: [MALE, FEMALE]
 *                 employeeIdNumber:
 *                   type: string
 *                 company:
 *                   type: object
 *                   properties:
 *                     organizationName:
 *                       type: string
 *                 payrollInfo:
 *                   type: object
 *                   properties:
 *                     tinNumber:
 *                       type: string
 *                     basicSalary:
 *                       type: number
 *                     currency:
 *                       type: string
 *                     employmentType:
 *                       type: string
 *                       enum: [CONTRACT, HOURLY, PERMANENT]
 *                     payFrequency:
 *                       type: string
 *                       enum: [MONTHLY, BIWEEKLY, WEEKLY, DAILY]
 *                     positionId:
 *                       type: string
 *                     roleId:
 *                       type: string
 *                     departmentId:
 *                       type: string
 *                     gradeId:
 *                       type: string
 *                 emergencyContacts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fullName:
 *                         type: string
 *                       relationship:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       email:
 *                         type: string
 *                       address:
 *                         type: string
 *                 positionHistory:
 *                   type: object
 *                   properties:
 *                     position:
 *                       type: object
 *                       properties:
 *                         positionName:
 *                           type: string
 *                 gradeHistory:
 *                   type: object
 *                   properties:
 *                     grade:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                 departmentHistory:
 *                   type: object
 *                   properties:
 *                     department:
 *                       type: object
 *                       properties:
 *                         deptName:
 *                           type: string
 *       404:
 *         description: Employee not found
 *       400:
 *         description: Invalid employee ID
 */

/**
 * @swagger
 * /api/v1/employees/assign-department:
 *   post:
 *     summary: Assign an employee to a department
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - departmentId
 *             properties:
 *               employeeId:
 *                 type: string
 *               departmentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee assigned to department successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 employeeId:
 *                   type: string
 *                 departmentId:
 *                   type: string
 *                 fromDate:
 *                   type: string
 *                   format: date-time
 *                 toDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       400:
 *         description: Invalid input or assignment failed
 */

/**
 * @swagger
 * /api/v1/employees/assign-position:
 *   post:
 *     summary: Assign an employee to a position
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - positionId
 *             properties:
 *               employeeId:
 *                 type: string
 *               positionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee assigned to position successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 employeeId:
 *                   type: string
 *                 positionId:
 *                   type: string
 *                 fromDate:
 *                   type: string
 *                   format: date-time
 *                 toDate:
 *                   type: string
 *                   format: date-time
 *                   nullable: true
 *       400:
 *         description: Invalid input or assignment failed
 */

/**
 * @swagger
 * /api/v1/employees/generate-password:
 *   post:
 *     summary: Generate a new password for an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - employeeId
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input or assignment failed
 */

/**
 * @swagger
 * /api/v1/employees/seach/keyword/employee:
 *   get:
 *     summary: Search employees by name or phone number
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         description: Search keyword (name or phone number)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         required: false
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: Employees fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       phoneNumber:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       400:
 *         description: Invalid query parameters
 */
