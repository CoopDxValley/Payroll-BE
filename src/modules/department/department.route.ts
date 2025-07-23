import express from "express";
import departmentController from "./department.controller";
// import validate from "../../middlewares/validate";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/checkPermissions";
// import adminValidation from "../../validations/admin.validation";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_system_setting"),
    // validate(adminValidation.createDepartmentSchema),
    departmentController.createDepartment
  )
  .get(
    auth(),
    // checkPermission("view_system_setting"),
    departmentController.getAllDepartments
  );

router
  .route("/:id")
  .get(
    auth(),
    checkPermission("view_system_setting"),
    // validate(adminValidation.getDepartmentSchema),
    departmentController.getDepartmentById
  )
  .post(
    auth(),
    // checkPermission("update_system_setting"),
    // validate(adminValidation.updateDepartmentSchema),
    departmentController.updateDepartment
  )
  .delete(
    auth(),
    checkPermission("delete_system_setting"),
    // validate(adminValidation.getDepartmentSchema),
    departmentController.deleteDepartment
  );

// router
//   .route("/center/:centerId")
//   .get(
//     auth(),
//     validate(adminValidation.getDepartmentsByCenterSchema),
//     departmentController.getDepartmentsByCenter
//   );

export default router;
