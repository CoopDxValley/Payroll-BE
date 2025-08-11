import express from "express";
import shiftController from "./shift.controller";
import auth from "../../middlewares/auth";
// import { checkPermission } from "../../middlewares/checkPermissions";
// import validate from "../../middlewares/validate";
// import shiftValidation from "../../validations/shift.validation";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_shift"),
    // validate(shiftValidation.createShift),
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
