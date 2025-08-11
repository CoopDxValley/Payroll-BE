import express from "express";
import shiftDayController from "./shiftDay.controller";
import auth from "../../middlewares/auth";
// import { checkPermission } from "../../middlewares/checkPermissions";
// import validate from "../../middlewares/validate";
// import shiftDayValidation from "./shiftDay.validation";

const router = express.Router();
router.route("/delete/:id").post(
  auth(),
  // checkPermission("delete_shift_day"),
  shiftDayController.deleteShiftDay
);

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_shift_day"),
    // validate(shiftDayValidation.createShiftDay),
    shiftDayController.createShiftDay
  )
  .get(
    auth(),
    // checkPermission("view_shift_day"),
    shiftDayController.getAllShiftDays
  );

router
  .route("/:id")
  .get(
    auth(),
    // checkPermission("view_shift_day"),
    shiftDayController.getShiftDayById
  )
  .post(
    auth(),
    // checkPermission("update_shift_day"),
    shiftDayController.updateShiftDay
  );

export default router;
