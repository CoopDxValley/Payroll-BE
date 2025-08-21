import express from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import overtimeManagementValidation from "./overtimeManagement.validation";
import overtimeManagementController from "./overtimeManagement.controller";

const router = express.Router();

// Enhanced Overtime Routes

// Today's overtime
router
  .route("/today")
  .get(
    auth(),
    // validate(overtimeManagementValidation.getTodaysOvertime),
    overtimeManagementController.getTodaysOvertime
  );

// Date range overtime
router
  .route("/date-range")
  .get(
    auth(),
    validate(overtimeManagementValidation.getOvertimeByDateRange),
    overtimeManagementController.getOvertimeByDateRange
  );

// Weekly overtime
router
  .route("/current-week")
  .get(
    auth(),
    validate(overtimeManagementValidation.getWeeklyOvertime),
    overtimeManagementController.getWeeklyOvertime
  );

// Monthly overtime
router
  .route("/current-month")
  .get(
    auth(),
    validate(overtimeManagementValidation.getMonthlyOvertime),
    overtimeManagementController.getMonthlyOvertime
  );

// Yearly overtime
router
  .route("/current-year")
  .get(
    auth(),
    validate(overtimeManagementValidation.getYearlyOvertime),
    overtimeManagementController.getYearlyOvertime
  );

// Overtime by specific date
router
  .route("/by-date")
  .get(
    auth(),
    validate(overtimeManagementValidation.getOvertimeByDate),
    overtimeManagementController.getOvertimeByDate
  );

// Overtime summary
router
  .route("/summary")
  .get(
    auth(),
    validate(overtimeManagementValidation.getOvertimeSummary),
    overtimeManagementController.getOvertimeSummary
  );

// OvertimeTable CRUD Routes

// Create overtime record
router
  .route("/")
  .post(
    auth(),
    validate(overtimeManagementValidation.createOvertimeTable),
    overtimeManagementController.createOvertimeTable
  )
  .get(auth(), overtimeManagementController.getOvertimeTables);

// Get, update, and delete overtime by ID
router
  .route("/:id")
  .get(
    auth(),
    validate(overtimeManagementValidation.getOvertimeTableById),
    overtimeManagementController.getOvertimeTableById
  )
  .post(
    auth(),
    validate(overtimeManagementValidation.updateOvertimeTable),
    overtimeManagementController.updateOvertimeTable
  );
router
  .route("/delete/:id")
  .post(
    auth(),
    validate(overtimeManagementValidation.deleteOvertimeTable),
    overtimeManagementController.deleteOvertimeTable
  );

// Update overtime status
router
  .route("/:id/status")
  .post(
    auth(),
    validate(overtimeManagementValidation.updateOvertimeStatus),
    overtimeManagementController.updateOvertimeStatus
  );

export default router;
