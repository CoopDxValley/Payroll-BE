 import express from "express";
import rotatingShiftTypeController from "./rotatingShiftType.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import rotatingShiftTypeValidation from "./rotatingShiftType.validation";
// import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate(rotatingShiftTypeValidation.createRotatingShiftType),
    // checkPermission("create_rotating_shift_type"),
    rotatingShiftTypeController.createRotatingShiftType
  )
  .get(
    auth(),
    // checkPermission("view_rotating_shift_type"),
    rotatingShiftTypeController.getRotatingShiftTypes
  );

router
  .route("/:id")
  .get(
    auth(),
    validate(rotatingShiftTypeValidation.getRotatingShiftTypeById),
    // checkPermission("view_rotating_shift_type"),
    rotatingShiftTypeController.getRotatingShiftTypeById
  )
  .post(
    auth(),
    validate(rotatingShiftTypeValidation.updateRotatingShiftType),
    // checkPermission("update_rotating_shift_type"),
    rotatingShiftTypeController.updateRotatingShiftType
  );

router
  .route("/delete/:id")
  .post(
    auth(),
    validate(rotatingShiftTypeValidation.deleteRotatingShiftType),
    // checkPermission("delete_rotating_shift_type"),
    rotatingShiftTypeController.deleteRotatingShiftType
  );

router
  .route("/deactivate/:id")
  .post(
    auth(),
    validate(rotatingShiftTypeValidation.deactivateRotatingShiftType),
    // checkPermission("update_rotating_shift_type"),
    rotatingShiftTypeController.deactivateRotatingShiftType
  );

router
  .route("/activate/:id")
  .post(
    auth(),
    validate(rotatingShiftTypeValidation.activateRotatingShiftType),
    // checkPermission("update_rotating_shift_type"),
    rotatingShiftTypeController.activateRotatingShiftType
  );

export default router; 