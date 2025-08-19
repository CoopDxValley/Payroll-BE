import express from "express";
import shiftController from "./shiftDay.controller";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import shiftValidation from "./shiftDay.validation";
// import { checkPermission } from "../../middlewares/checkPermissions";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate(shiftValidation.createShiftDay),
    // checkPermission("create_shift"),
    shiftController.createShift
  )
  .get(
    auth(),
    // checkPermission("view_shift"),
    shiftController.getAllShifts
  );

router
  .route("/:id")
  .get(
    auth(),
    // checkPermission("view_shift"),
    shiftController.getShiftById
  )
  .post(
    auth(),
    validate(shiftValidation.updateShiftDay),
    // checkPermission("update_shift"),
    shiftController.updateShift
  )

  router
  .route("/delete/:id")
  .post(
    auth(),
    // checkPermission("delete_shift"),
    shiftController.deleteShift
  );

export default router;
