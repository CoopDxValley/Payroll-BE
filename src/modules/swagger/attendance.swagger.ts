/**
 * @swagger
 * components:
 *   schemas:
 *     Attendance:
 *       type: object
 *       required:
 *         - id
 *         - employeeId
 *         - date
 *         - checkTime
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the attendance record
 *         employeeId:
 *           type: string
 *           format: uuid
 *           description: ID of the employee
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the attendance record (YYYY-MM-DD)
 *         checkTime:
 *           type: string
 *           format: date-time
 *           description: Timestamp when employee checked in/out
 *         checkType:
 *           type: string
 *           enum: [IN, OUT]
 *           description: Type of check (IN or OUT)
 *         verifyMode:
 *           type: integer
 *           description: Verification mode from device
 *         workCode:
 *           type: integer
 *           description: Work code from device
 *         sensorId:
 *           type: string
 *           description: Sensor ID from device
 *         deviceIp:
 *           type: string
 *           description: IP address of the device
 *         deviceUserId:
 *           type: string
 *           description: Original device user ID
 *         isAbsent:
 *           type: boolean
 *           default: false
 *           description: Whether the employee was absent
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Record creation timestamp
 *         employee:
 *           $ref: '#/components/schemas/EmployeeBasic'
 *     
 *     EmployeeBasic:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         username:
 *           type: string
 *         deviceUserId:
 *           type: string
 *     
 *     DeviceAttendanceRecord:
 *       type: object
 *       required:
 *         - deviceUserId
 *         - checkTime
 *         - verifyMode
 *         - workCode
 *       properties:
 *         deviceUserId:
 *           type: string
 *           description: Device user ID
 *         checkTime:
 *           type: string
 *           format: date-time
 *           description: Check-in/out timestamp
 *         verifyMode:
 *           type: integer
 *           description: Verification mode (e.g., 15)
 *         workCode:
 *           type: integer
 *           description: Work code (e.g., 0)
 *         sensorId:
 *           type: string
 *           description: Sensor identifier
 *         deviceIp:
 *           type: string
 *           description: Device IP address
 *     
 *     AttendanceSummary:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [PRESENT, ABSENT]
 *         checkIn:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         checkOut:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         totalHours:
 *           type: number
 *           format: float
 *           description: Total hours worked
 *         records:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Attendance'
 *     
 *     ProcessDeviceDataRequest:
 *       type: object
 *       required:
 *         - attendanceRecords
 *       properties:
 *         attendanceRecords:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DeviceAttendanceRecord'
 *     
 *     ProcessDeviceDataTextRequest:
 *       type: object
 *       required:
 *         - deviceDataText
 *       properties:
 *         deviceDataText:
 *           type: string
 *           description: Raw device data text from ZKTeck SpeedH5
 *           example: |
 *             Today's attendance records:
 *             <Attendance>: 240163 : 2025-07-25 06:54:21 (15, 0)
 *             <Attendance>: 240089 : 2025-07-25 07:05:49 (15, 0)
 *             <Attendance>: 220692 : 2025-07-25 07:17:57 (15, 0)
 *     
 *     BulkAttendanceRequest:
 *       type: object
 *       required:
 *         - employeeId
 *         - records
 *       properties:
 *         employeeId:
 *           type: string
 *           format: uuid
 *         records:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date-time
 *               checkTime:
 *                 type: string
 *                 format: date-time
 *               checkType:
 *                 type: string
 *                 enum: [IN, OUT]
 *               verifyMode:
 *                 type: integer
 *               workCode:
 *                 type: integer
 *               sensorId:
 *                 type: string
 *               deviceIp:
 *                 type: string
 *               deviceUserId:
 *                 type: string
 *     
 *     AttendanceResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/Attendance'
 *             - type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *         count:
 *           type: integer
 *     
 *     ProcessingResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             successful:
 *               type: integer
 *               description: Number of successfully processed records
 *             failed:
 *               type: integer
 *               description: Number of failed records
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   deviceUserId:
 *                     type: string
 *                   error:
 *                     type: string
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         error:
 *           type: string
 *   
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

export const attendanceSwaggerSchemas = {
  // This file contains all the schema definitions above
  // They will be automatically picked up by swagger-jsdoc
}; 