import express from "express";
import updatedAttendanceController from "./updatedAttendance.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import updatedAttendanceValidation from "./updatedAttendance.validation";

const router = express.Router();

// Smart Attendance Route (Main API)
router
  .route("/attendance")
  .post(
    auth(),
    validate(updatedAttendanceValidation.smartAttendance),
    updatedAttendanceController.smartAttendance
  );

// WorkSession Routes
router
  .route("/work-sessions")
  .post(
    auth(),
    validate(updatedAttendanceValidation.createWorkSession),
    updatedAttendanceController.createWorkSession
  )
  .get(
    auth(),
    updatedAttendanceController.getWorkSessions
  );

router
  .route("/work-sessions/:id")
  .get(
    auth(),
    validate(updatedAttendanceValidation.getWorkSessionById),
    updatedAttendanceController.getWorkSessionById
  )
  .patch(
    auth(),
    validate(updatedAttendanceValidation.updateWorkSession),
    updatedAttendanceController.updateWorkSession
  )
  .delete(
    auth(),
    validate(updatedAttendanceValidation.deleteWorkSession),
    updatedAttendanceController.deleteWorkSession
  );

// Punch Routes
router
  .route("/punch-in")
  .post(
    auth(),
    validate(updatedAttendanceValidation.punchIn),
    updatedAttendanceController.punchIn
  );

router
  .route("/punch-out")
  .post(
    auth(),
    validate(updatedAttendanceValidation.punchOut),
    updatedAttendanceController.punchOut
  );

// OvertimeTable Routes
router
  .route("/overtime")
  .post(
    auth(),
    validate(updatedAttendanceValidation.createOvertimeTable),
    updatedAttendanceController.createOvertimeTable
  )
  .get(
    auth(),
    updatedAttendanceController.getOvertimeTables
  );

router
  .route("/overtime/:id")
  .get(
    auth(),
    validate(updatedAttendanceValidation.getOvertimeTableById),
    updatedAttendanceController.getOvertimeTableById
  )
  .patch(
    auth(),
    validate(updatedAttendanceValidation.updateOvertimeTable),
    updatedAttendanceController.updateOvertimeTable
  )
  .delete(
    auth(),
    validate(updatedAttendanceValidation.deleteOvertimeTable),
    updatedAttendanceController.deleteOvertimeTable
  );

router
  .route("/overtime/:id/status")
  .patch(
    auth(),
    validate(updatedAttendanceValidation.updateOvertimeStatus),
    updatedAttendanceController.updateOvertimeStatus
  );

export default router; 