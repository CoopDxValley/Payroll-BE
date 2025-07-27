/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Manage attendance records and queries
 */
/**
 * @swagger
 * /api/v1/attendance:
 *   post:
 *     summary: Create a new attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAttendance'
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance logged
 *                 data:
 *                   $ref: '#/components/schemas/CreateAttendance'  # or your attendance response schema
 *       400:
 *         description: Bad Request
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAttendance:
 *       type: object
 *       required:
 *         - deviceUserId
 *         - checkTime
 *       properties:
 *         deviceUserId:
 *           type: string
 *           description: User ID from the device
 *           example: "12345"
 *         date:
 *           type: string
 *           format: date
 *           description: Attendance date (optional, defaults to checkTime's date)
 *           example: "2025-07-27"
 *         checkTime:
 *           type: string
 *           format: date-time
 *           description: The exact time of the attendance check (required)
 *           example: "2025-07-27T08:30:00Z"
 *         checkType:
 *           type: string
 *           description: Check type, e.g., "IN" or "OUT" (optional, auto-determined if missing)
 *           example: "IN"
 *         verifyMode:
 *           type: string
 *           description: Verification mode used by device (optional)
 *           example: "Fingerprint"
 *         workCode:
 *           type: string
 *           description: Work code if applicable (optional)
 *           example: "WC01"
 *         sensorId:
 *           type: string
 *           description: Sensor identifier (optional)
 *           example: "S01"
 *         deviceIp:
 *           type: string
 *           description: IP address of the device (optional)
 *           example: "192.168.1.100"
 *         isAbsent:
 *           type: boolean
 *           description: Marks the attendance as absent (optional, default false)
 *           example: false
 */

// /**
//  * @swagger
//  * /api/v1/attendance:
//  *   post:
//  *     summary: Create a new attendance record
//  *     tags: [Attendance]
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             $ref: '#/components/schemas/CreateAttendance'
//  *     responses:
//  *       201:
//  *         description: Attendance record created successfully
//  *       400:
//  *         description: Bad Request
//  *   get:
//  *     summary: Get all attendance logs
//  *     tags: [Attendance]
//  *     security:
//  *       - bearerAuth: []
//  *     responses:
//  *       200:
//  *         description: List of attendance logs
//  */

/**
 * @swagger
 * /api/v1/attendance/bulk-device-registration:
 *   post:
 *     summary: Bulk device registration for attendance
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkDeviceRegistration'
 *     responses:
 *       200:
 *         description: Devices registered successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/attendance/date-range:
 *   get:
 *     summary: Get attendance records in a specified date range
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Attendance records in the date range
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/attendance/today:
 *   get:
 *     summary: Get today's attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for today
 */

/**
 * @swagger
 * /api/v1/attendance/weekly:
 *   get:
 *     summary: Get attendance records for the current week
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for the current week
 */

/**
 * @swagger
 * /api/v1/attendance/monthly:
 *   get:
 *     summary: Get attendance records for the current month
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for the current month
 */

/**
 * @swagger
 * /api/v1/attendance/year:
 *   get:
 *     summary: Get attendance records for the current year
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records for the current year
 */


/**
 * @swagger
 * /api/v1/attendance/summary:
 *   get:
 *     summary: Get summary of attendance records in a date range
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Attendance summary in the date range
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /api/v1/attendance/{id}:
 *   get:
 *     summary: Get attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Attendance record ID
 *     responses:
 *       200:
 *         description: Attendance record details
 *       404:
 *         description: Attendance record not found
 */


/**
 * @swagger
 * /api/v1/attendance/update-timestamp/{id}:
 *   post:
 *     summary: Update attendance check time for a record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Attendance record ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: New checkTime to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - checkTime
 *             properties:
 *               checkTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-07-27T09:45:00Z"
 *     responses:
 *       200:
 *         description: Attendance timestamp updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Attendance timestamp updated
 *                 data:
 *                   $ref: '#/components/schemas/CreateAttendance' # or your attendance schema
 *       400:
 *         description: Bad request - missing or invalid checkTime
 *       404:
 *         description: Attendance record not found
 */
