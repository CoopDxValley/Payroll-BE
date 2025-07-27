import express from "express";
import attendanceController from "./attendance.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
import { validate } from "../../middlewares/validate";
import attendanceValidation from "./attendance.validation";

const router = express.Router();

// Basic attendance routes
router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_attendance"),
    validate(attendanceValidation.createAttendance),
    attendanceController.createAttendance
  )
  .get(
    auth(),
    // checkPermission("view_attendance"),
    attendanceController.getAllAttendanceLogs
  );

// Bulk device registration route
router.route("/bulk-device-registration").post(
  auth(),
  // checkPermission("create_attendance"),
  validate(attendanceValidation.bulkDeviceRegistration),
  attendanceController.bulkDeviceRegistration
);

// Date range query routes
router.route("/date-range").get(
  auth(),
  // checkPermission("view_attendance"),
  validate(attendanceValidation.getAttendanceByRange),
  attendanceController.getAttendanceByDateRange
);

router.route("/today").get(
  auth(),
  // checkPermission("view_attendance"),
  // validate(attendanceValidation.getAttendanceByRange),
  attendanceController.getTodaysAttendace
);

router.route("/weekly").get(
  auth(),
  // checkPermission("view_attendance"),
  // validate(attendanceValidation.getAttendanceByRange),
  attendanceController.getWeeklyAttendance
);

router.route("/monthly").get(
  auth(),
  // checkPermission("view_attendance"),
  // validate(attendanceValidation.getAttendanceByRange),
  attendanceController.getWeeklyAttendance
);
router.route("/year").get(
  auth(),
  // checkPermission("view_attendance"),
  // validate(attendanceValidation.getAttendanceByRange),
  attendanceController.getYearlyAttendance
);
router.route("/by-date").get(
  auth(),
  // checkPermission("view_attendance"),
  validate(attendanceValidation.getAttendanceByDate),
  attendanceController.getAttendanceByDate
);

router.route("/summary").get(
  auth(),
  // checkPermission("view_attendance"),
  validate(attendanceValidation.getAttendanceByRange),
  attendanceController.getAttendanceSummary
);
router.post(
  "/update-timestamp/:id",
  auth(),
  // checkPermission("update_attendance"),
  validate(attendanceValidation.updateAttendanceTimestamp), // validate checkTime in body
  attendanceController.updateAttendanceTimestamp
);

router.route("/:id").get(
  auth(),
  // checkPermission("view_attendance"),
  attendanceController.getAttendanceById
);

export default router;
