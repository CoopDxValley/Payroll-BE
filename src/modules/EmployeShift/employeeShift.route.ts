import express from "express";
import employeeShiftController from "./employeeShift.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
// import validate from "../../middlewares/validate";
// import employeeShiftValidation from "./employeeShift.validation";

const router = express.Router();

// Assign shift to employee
router.route("/assign").post(
  auth(),
  // checkPermission("assign_shift"),
  // validate(employeeShiftValidation.assignShift),
  employeeShiftController.assignShiftToEmployee
);

// Unassign shift from employee
// router
//   // .route("/unassign/:employeeId/:shiftId")
//   .route("/unassign?employeeId=employeeId&shiftId=shiftId")
//   .post(
//     auth(),
//     // checkPermission("unassign_shift"),
//     employeeShiftController.unassignShiftFromEmployee
//   );

router.route("/unassign").post(
  auth(),
  // checkPermission("unassign_shift"),
  employeeShiftController.unassignShiftFromEmployee
);
// Get all employee shifts (with optional employeeId filter)
router.route("/").get(
  auth(),
  // checkPermission("view_employee_shifts"),
  employeeShiftController.getEmployeeShifts
);

// Get specific employee shift by ID
router.route("/:id").get(
  auth(),
  // checkPermission("view_employee_shifts"),
  employeeShiftController.getEmployeeShiftById
);

// Get active shift assignment for employee
router.route("/active/:employeeId").get(
  auth(),
  // checkPermission("view_employee_shifts"),
  employeeShiftController.getActiveEmployeeShift
);

// Get shift history for employee
router.route("/history/:employeeId").get(
  auth(),
  // checkPermission("view_employee_shifts"),
  employeeShiftController.getEmployeeShiftHistory
);

export default router;
