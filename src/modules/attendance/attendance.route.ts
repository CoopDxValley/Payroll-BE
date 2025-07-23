import express from "express";
import attendanceController from "./attendance.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
// import validate from "../../middlewares/validate";
// import attendanceValidation from "../../validations/attendance.validation";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_attendance"),
    // validate(attendanceValidation.createAttendance),
    attendanceController.createAttendance
  )
  .get(
    auth(),
    // checkPermission("view_attendance"),
    attendanceController.getAllAttendanceLogs
  );


  
router
  .route("/:id")
  .get(
    auth(),
    // checkPermission("view_attendance"),
    attendanceController.getAttendanceById
  );

export default router;
