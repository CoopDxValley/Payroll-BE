import express from "express";
import workingCalendarController from "./workingCalendar.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";
import { validate } from "../../middlewares/validate";
import workingCalendarValidation from "./workingCalendar.validation";

const router = express.Router();

// Create a single working calendar entry
router.route("/").post(
  auth(),
  // checkPermission("create_working_calendar"),
  validate(workingCalendarValidation.createWorkingCalendar),
  workingCalendarController.createWorkingCalendar
);

// Get all working calendar entries (with filters)
router.route("/").get(
  auth(),
  // checkPermission("view_working_calendar"),
  // validate(workingCalendarValidation.getAllWorkingCalendar),
  workingCalendarController.getAllWorkingCalendar
);
//GET BY DATE RANGE
router.route("/date-range").get(
  auth(),
  // checkPermission("view_working_calendar"),
  validate(workingCalendarValidation.getWorkingCalendarByDateRange),
  workingCalendarController.getWorkingCalendarByDateRange
);
// Get working calendar entry by ID
router.route("/:id").get(
  auth(),
  // checkPermission("view_working_calendar"),
  validate(workingCalendarValidation.getWorkingCalendarById),
  workingCalendarController.getWorkingCalendarById
);
// Bulk upload working calendar entries
router.route("/bulk-upload").post(
  auth(),
  // checkPermission("create_working_calendar"),
  validate(workingCalendarValidation.bulkUploadWorkingCalendar),
  workingCalendarController.bulkUploadWorkingCalendar
);

// Update working calendar entry
router.route("/:id").post(
  auth(),
  // checkPermission("update_working_calendar"),
  validate(workingCalendarValidation.updateWorkingCalendar),
  workingCalendarController.updateWorkingCalendar
);

// Delete working calendar entry
router.route("/delete/:id").post(
  auth(),
  // checkPermission("delete_working_calendar"),
  validate(workingCalendarValidation.deleteWorkingCalendar),
  workingCalendarController.deleteWorkingCalendar
);

// Get working calendar by year
router.route("/year/:year").get(
  auth(),
  // checkPermission("view_working_calendar"),
  // validate(workingCalendarValidation.getWorkingCalendarByYear),
  workingCalendarController.getWorkingCalendarByYear
);

// Get working calendar by date range

// Toggle working calendar entry active status
router.route("/:id/toggle-status").post(
  auth(),
  // checkPermission("update_working_calendar"),
  validate(workingCalendarValidation.toggleWorkingCalendarStatus),
  workingCalendarController.toggleWorkingCalendarStatus
);

export default router;
