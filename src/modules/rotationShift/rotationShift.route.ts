import express from "express";
import rotationShiftController from "./rotationShift.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import rotationShiftValidation from "./rotationShift.validation";

const router = express.Router();

// ==================== SHIFT SCHEDULE ROUTES ====================
// Get employee rotation summary
router.route("/employees/summary/:employeeId").get(
  auth(),
  // validate(rotationShiftValidation.getEmployeeRotationSummary),
  rotationShiftController.getEmployeeRotationSummary
);

router.route("/employees/summary").get(
  auth(),
  // validate(rotationShiftValidation.getEmployeeRotationSummary),
  rotationShiftController.getAllEmployeeRotationSummaries
);
// Create new shift schedule
router
  .route("/schedules")
  .post(
    auth(),
    validate(rotationShiftValidation.createShiftSchedule),
    rotationShiftController.createShiftSchedule
  );

// Get all shift schedules with optional filters
router
  .route("/schedules")
  .get(auth(), rotationShiftController.getShiftSchedules);

// Get specific shift schedule by ID
router
  .route("/schedules/:id")
  .get(
    auth(),
    validate(rotationShiftValidation.getShiftScheduleById),
    rotationShiftController.getShiftScheduleById
  );

// Update shift schedule
router
  .route("/schedules/:id")
  .post(
    auth(),
    validate(rotationShiftValidation.updateShiftSchedule),
    rotationShiftController.updateShiftSchedule
  );

// Approve shift schedule
router
  .route("/schedules/:id/approve")
  .post(
    auth(),
    validate(rotationShiftValidation.approveShiftSchedule),
    rotationShiftController.approveShiftSchedule
  );

// Delete shift schedule
router
  .route("/schedules/:id")
  .delete(
    auth(),
    validate(rotationShiftValidation.deleteShiftSchedule),
    rotationShiftController.deleteShiftSchedule
  );

// ==================== EMPLOYEE SHIFT ASSIGNMENT ROUTES ====================

// Create new employee shift assignment
router
  .route("/assignments")
  .post(
    auth(),
    validate(rotationShiftValidation.createEmployeeShiftAssignment),
    rotationShiftController.createEmployeeShiftAssignment
  );

// Get all employee shift assignments with optional filters
router
  .route("/assignments")
  .get(auth(), rotationShiftController.getEmployeeShiftAssignments);

// Update employee shift assignment
router
  .route("/assignments/:id")
  .patch(
    auth(),
    validate(rotationShiftValidation.updateEmployeeShiftAssignment),
    rotationShiftController.updateEmployeeShiftAssignment
  );

// Approve employee shift assignment
router
  .route("/assignments/:id/approve")
  .post(
    auth(),
    validate(rotationShiftValidation.approveEmployeeShiftAssignment),
    rotationShiftController.approveEmployeeShiftAssignment
  );

// Delete employee shift assignment
router
  .route("/assignments/:id")
  .delete(
    auth(),
    validate(rotationShiftValidation.deleteEmployeeShiftAssignment),
    rotationShiftController.deleteEmployeeShiftAssignment
  );

// ==================== BULK OPERATION ROUTES ====================

// Bulk create assignments
router
  .route("/assignments/bulk")
  .post(
    auth(),
    validate(rotationShiftValidation.bulkCreateAssignments),
    rotationShiftController.bulkCreateAssignments
  );

// Bulk update assignments
router
  .route("/assignments/update/bulk")
  .post(
    auth(),
    validate(rotationShiftValidation.bulkUpdateAssignments),
    rotationShiftController.bulkUpdateAssignments
  );

// // Get employee rotation summary
// router
//   .route("/employees/summary/:employeeId")
//   .get(
//     auth(),
//     // validate(rotationShiftValidation.getEmployeeRotationSummary),
//     rotationShiftController.getEmployeeRotationSummary
//   );

export default router;
