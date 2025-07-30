import express from "express";
import leaveTypeController from "./leaveType.controller";
// import validate from "../../middlewares/validate";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";
// import leaveTypeValidation from "../../validations/leaveType.validation";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_system_setting"),
    // validate(leaveTypeValidation.createLeaveType),
    leaveTypeController.createLeaveType
  )
  .get(
    auth(),
    // checkPermission("view_system_setting"),
    leaveTypeController.getAllLeaveTypes
  );

router.route("/:id").get(auth(), leaveTypeController.getLeaveTypeById).post(
  auth(),
  // validate(leaveTypeValidation.updateLeaveType),
  leaveTypeController.updateLeaveType
);
router.route("/delete/:id").post(auth(), leaveTypeController.deleteLeaveType);

export default router;
