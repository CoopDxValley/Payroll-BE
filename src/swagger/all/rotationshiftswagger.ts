/**
 * @swagger
 * tags:
 *   name: RotationShifts
 *   description: Rotation shift management for employee schedules
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/schedules:
 *   post:
 *     summary: Create a new shift schedule
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shiftId
 *               - name
 *               - startDate
 *               - endDate
 *             properties:
 *               shiftId:
 *                 type: string
 *                 format: uuid
 *                 description: Must be a ROTATING type shift
 *                 example: "5c19251a-7b70-41ef-9b4b-b95fc003c480"
 *               name:
 *                 type: string
 *                 example: "Security August 2025 Week 1"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-07"
 *     responses:
 *       201:
 *         description: Shift schedule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shift schedule created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     startDate:
 *                       type: string
 *                       format: date
 *                     endDate:
 *                       type: string
 *                       format: date
 *                     isActive:
 *                       type: boolean
 *                     isApproved:
 *                       type: boolean
 *       400:
 *         description: Invalid input or business rule violation
 *       404:
 *         description: Shift not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/schedules:
 *   get:
 *     summary: Get all shift schedules with optional filters
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:


 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter schedules starting from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter schedules ending before date
 *     responses:
 *       200:
 *         description: List of shift schedules
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
 *                       startDate:
 *                         type: string
 *                         format: date
 *                       endDate:
 *                         type: string
 *                         format: date
 *                       isActive:
 *                         type: boolean
 *                       isApproved:
 *                         type: boolean
 *                       company:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           companyCode:
 *                             type: string
 *                       shift:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           shiftType:
 *                             type: string
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/schedules/{id}:
 *   get:
 *     summary: Get a specific shift schedule by ID
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift schedule ID
 *     responses:
 *       200:
 *         description: Shift schedule details
 *       404:
 *         description: Shift schedule not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/schedules/{id}:
 *   post:
 *     summary: Update a shift schedule
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift schedule ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Schedule Name"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2025-08-07"
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Shift schedule updated successfully
 *       400:
 *         description: Invalid input or business rule violation
 *       404:
 *         description: Shift schedule not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/schedules/{id}/approve:
 *   post:
 *     summary: Approve a shift schedule
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift schedule ID
 *     responses:
 *       200:
 *         description: Shift schedule approved successfully
 *       400:
 *         description: Cannot approve already approved schedule
 *       404:
 *         description: Shift schedule not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/schedules/{id}:
 *   delete:
 *     summary: Delete a shift schedule
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Shift schedule ID
 *     responses:
 *       200:
 *         description: Shift schedule deleted successfully
 *       400:
 *         description: Cannot delete approved schedule
 *       404:
 *         description: Shift schedule not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/assignments:
 *   post:
 *     summary: Create a new employee shift assignment
 *     tags: [RotationShifts]
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
 *               - date
 *             properties:
 *               employeeId:
 *                 type: string
 *                 format: uuid
 *                 description: Employee must have a ROTATION shift type
 *                 example: "469bae59-5349-42ad-b43b-c1260e27df76"
 *               scheduleId:
 *                 type: string
 *                 format: uuid
 *                 description: Optional link to shift schedule
 *                 example: "5c19251a-7b70-41ef-9b4b-b95fc003c480"
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Must be in YYYY-MM-DD format
 *                 example: "2025-08-09"
 *               shiftTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: null = OFF day, uuid = actual shift type
 *                 example: "785b941a-65e4-4def-8476-990b5b390b34"
 *     responses:
 *       201:
 *         description: Shift assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Shift assignment created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     employeeId:
 *                       type: string
 *                       format: uuid
 *                     date:
 *                       type: string
 *                       format: date
 *                     shiftTypeId:
 *                       type: string
 *                       format: uuid
 *                     hours:
 *                       type: number
 *                     isApproved:
 *                       type: boolean
 *                     employee:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         username:
 *                           type: string
 *                     schedule:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         startDate:
 *                           type: string
 *                           format: date
 *                         endDate:
 *                           type: string
 *                           format: date
 *                     shiftType:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         startTime:
 *                           type: string
 *                         endTime:
 *                           type: string
 *                         duration:
 *                           type: number
 *       400:
 *         description: Invalid input or business rule violation
 *       404:
 *         description: Employee, schedule, or shift type not found
 *       409:
 *         description: Employee already has an assignment for this date
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/assignments:
 *   get:
 *     summary: Get all employee shift assignments with optional filters
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific employee
 *       - in: query
 *         name: scheduleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific schedule
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter assignments from date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter assignments before date
 *       - in: query
 *         name: shiftTypeId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by specific shift type
 *       - in: query
 *         name: isApproved
 *         schema:
 *           type: boolean
 *         description: Filter by approval status
 *     responses:
 *       200:
 *         description: List of employee shift assignments
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
 *                       employeeId:
 *                         type: string
 *                         format: uuid
 *                       date:
 *                         type: string
 *                         format: date
 *                       shiftTypeId:
 *                         type: string
 *                         format: uuid
 *                       hours:
 *                         type: number
 *                       isApproved:
 *                         type: boolean
 *                       employee:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           username:
 *                             type: string
 *                       schedule:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           startDate:
 *                             type: string
 *                             format: date
 *                           endDate:
 *                             type: string
 *                             format: date
 *                       shiftType:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                           endTime:
 *                             type: string
 *                           duration:
 *                             type: number
 *                 count:
 *                   type: number
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/assignments/{id}:
 *   patch:
 *     summary: Update an employee shift assignment
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               shiftTypeId:
 *                 type: string
 *                 format: uuid
 *                 description: null = OFF day, uuid = actual shift type
 *                 example: "785b941a-65e4-4def-8476-990b5b390b34"
 *     responses:
 *       200:
 *         description: Shift assignment updated successfully
 *       400:
 *         description: Invalid input or business rule violation
 *       404:
 *         description: Assignment or shift type not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/assignments/{id}/approve:
 *   post:
 *     summary: Approve an employee shift assignment
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Shift assignment approved successfully
 *       400:
 *         description: Assignment is already approved
 *       404:
 *         description: Assignment not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/assignments/{id}:
 *   delete:
 *     summary: Delete an employee shift assignment
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Assignment ID
 *     responses:
 *       200:
 *         description: Shift assignment deleted successfully
 *       400:
 *         description: Cannot delete approved assignment
 *       404:
 *         description: Assignment not found
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/assignments/bulk:
 *   post:
 *     summary: Bulk create employee shift assignments
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - scheduleId
 *               - assignments
 *             properties:
 *               scheduleId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the shift schedule
 *                 example: "5c19251a-7b70-41ef-9b4b-b95fc003c480"
 *               assignments:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required:
 *                     - employeeId
 *                     - date
 *                   properties:
 *                     employeeId:
 *                       type: string
 *                       format: uuid
 *                       description: Employee must have a ROTATION shift type
 *                       example: "469bae59-5349-42ad-b43b-c1260e27df76"
 *                     date:
 *                       type: string
 *                       format: date
 *                       description: Must be in YYYY-MM-DD format
 *                       example: "2025-08-09"
 *                     shiftTypeId:
 *                       type: string
 *                       format: uuid
 *                       description: null = OFF day, uuid = actual shift type
 *                       example: "785b941a-65e4-4def-8476-990b5b390b34"
 *     responses:
 *       201:
 *         description: Bulk assignments created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "5 assignments created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: number
 *                       example: 5
 *       400:
 *         description: Invalid input or business rule violation
 *       409:
 *         description: Some assignments already exist for the specified dates
 */

/**
 * @swagger
 * /api/v1/rotation-shifts/employees/{employeeId}/summary:
 *   get:
 *     summary: Get employee rotation summary for a date range
 *     tags: [RotationShifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Employee ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for summary (YYYY-MM-DD)
 *         example: "2025-08-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for summary (YYYY-MM-DD)
 *         example: "2025-08-31"
 *     responses:
 *       200:
 *         description: Employee rotation summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDays:
 *                       type: number
 *                       description: Total days in the range
 *                     dayShifts:
 *                       type: number
 *                       description: Number of day shifts
 *                     nightShifts:
 *                       type: number
 *                       description: Number of night shifts
 *                     offDays:
 *                       type: number
 *                       description: Number of off days
 *                     totalHours:
 *                       type: number
 *                       description: Total hours worked
 *                     assignments:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           shiftTypeId:
 *                             type: string
 *                             format: uuid
 *                           shiftTypeName:
 *                             type: string
 *                           hours:
 *                             type: number
 *                           isApproved:
 *                             type: boolean
 *       400:
 *         description: Invalid date range
 *       404:
 *         description: Employee not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ShiftSchedule:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         companyId:
 *           type: string
 *           format: uuid
 *         shiftId:
 *           type: string
 *           format: uuid
 *           description: Must be ROTATING type
 *         name:
 *           type: string
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         isActive:
 *           type: boolean
 *         isApproved:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     EmployeeShiftAssignment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         employeeId:
 *           type: string
 *           format: uuid
 *         scheduleId:
 *           type: string
 *           format: uuid
 *         date:
 *           type: string
 *           format: date
 *         shiftTypeId:
 *           type: string
 *           format: uuid
 *           description: null = OFF day
 *         hours:
 *           type: number
 *         isApproved:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     
 *     RotatingShiftType:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "DAY"
 *         startTime:
 *           type: string
 *           example: "06:00:00"
 *         endTime:
 *           type: string
 *           example: "18:00:00"
 *         duration:
 *           type: number
 *           example: 12
 *         isActive:
 *           type: boolean
 */


