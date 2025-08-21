import express from "express";
import enhancedAttendanceController from "./enhanced-attendance.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import attendanceValidation from "./attendance.validation";

const router = express.Router();

// Enhanced attendance routes with shift-aware overtime calculation
router
  .route("/enhanced")
  .post(
    auth(),
    validate(attendanceValidation.createAttendance),
    enhancedAttendanceController.createEnhancedAttendanceRecord
  );

router
  .route("/enhanced/bulk")
  .post(
    auth(),
    validate(attendanceValidation.bulkCreateAttendance),
    enhancedAttendanceController.bulkCreateEnhancedAttendanceRecords
  );

export default router; 