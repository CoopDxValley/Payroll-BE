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
 *                   - gender
 *                   - dateOfBirth
 *                   - username
 *                   - phoneNumber
 *                 properties:
 *                   name:
 *                     type: string
 *                   gender:
 *                     type: string
 *                     enum: [MALE, FEMALE]
 *                   dateOfBirth:
 *                     type: string
 *                     format: date
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *                     format: email
 *                   phoneNumber:
 *                     type: string
 *                   optionalPhoneNumber:
 *                     type: string
 *                   employeeIdNumber:
 *                     type: string
 *                   nationality:
 *                     type: string
 *                     default: Ethiopia
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
 *                   - basicSalary
 *                   - employmentType
 *                   - positionId
 *                   - roleId
 *                   - departmentId
 *                   - gradeId
 *                 properties:
 *                   tinNumber:
 *                     type: string
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
 *                   positionId:
 *                     type: string
 *                     format: uuid
 *                   roleId:
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
