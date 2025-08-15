import express from "express";
import employeeShiftController from "./employeeShift.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import employeeShiftValidation from "./employeeShift.validation";
// import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

// Assign shift to employee
router.route("/assign").post(
  auth(),
  validate(employeeShiftValidation.assignShift),
  // checkPermission("assign_shift"),
  employeeShiftController.assignShiftToEmployee
);

// Unassign shift from employee
router.route("/unassign").post(
  auth(),
  validate(employeeShiftValidation.unassignShift),
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

// Get shift details with pattern information
router.route("/shift/:shiftId").get(
  auth(),
  validate(employeeShiftValidation.getShiftDetails),
  // checkPermission("view_employee_shifts"),
  employeeShiftController.getShiftDetails
);

// Calculate working hours for employee
router.route("/:employeeId/working-hours").get(
  auth(),
  validate(employeeShiftValidation.calculateWorkingHours),
  // checkPermission("view_employee_shifts"),
  employeeShiftController.calculateWorkingHours
);

export default router;
