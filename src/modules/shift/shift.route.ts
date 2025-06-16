import express from "express";
import shiftController from "./shift.controller";
// import validate from "../../middlewares/validate";
// import shiftValidation from "../../validations/shift.validation";
import auth from "../../middlewares/auth";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // validate(shiftValidation.createShift),
    shiftController.createShift
  )
  .get(auth(), shiftController.getShifts);

router
  .route("/:id")
  .get(auth(), shiftController.getShiftById)
  .post(
    auth(),
    // validate(shiftValidation.updateShift),
    shiftController.updateShift
  );
router.route("/delete/:id").post(auth(), shiftController.deleteShift);

export default router;
