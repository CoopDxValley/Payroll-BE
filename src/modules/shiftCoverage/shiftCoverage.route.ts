import express from "express";
import shiftCoverageController from "./shiftCoverage.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
import { validate } from "../../middlewares/validate";
import shiftCoverageValidation from "./shiftCoverage.validation";

const router = express.Router();

router.route("/request").post(
  auth(),
  // checkPermission("request_coverage"),
  validate(shiftCoverageValidation.fetchByStatus),
  shiftCoverageController.requestCoverage
);
router.route("/coverage").get(
  auth(),
  // checkPermission("view_coverage"),
  // validate(shiftCoverageValidation.requestCoverage),
  shiftCoverageController.getCoverageRequests
);

// Approve/reject coverage request
router.route("/status/:id").post(
  auth(),
  // checkPermission("approve_coverage"),
  validate(shiftCoverageValidation.updateStatus),
  shiftCoverageController.updateCoverageStatus
);

// Get all coverage requests (with filters)
router.route("/").get(
  auth(),
  // checkPermission("view_coverage"),
  shiftCoverageController.getAllCoverageRequests
);

// Get specific coverage request
router.route("/:id").get(
  auth(),
  // checkPermission("view_coverage"),
  shiftCoverageController.getCoverageRequestById
);

// Get coverage requests for specific employee
router.route("/employee/:employeeId").get(
  auth(),
  // checkPermission("view_coverage"),
  shiftCoverageController.getEmployeeCoverageRequests
);

// Get pending coverage requests for approval

// Cancel coverage request
router.route("/cancel/:id").post(
  auth(),
  // checkPermission("cancel_coverage"),
  shiftCoverageController.cancelCoverageRequest
);

export default router;
