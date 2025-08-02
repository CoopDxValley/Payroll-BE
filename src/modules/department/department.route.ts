import express from "express";
import departmentController from "./department.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";
import { validate } from "../../middlewares/validate";
import adminValidation from "./department.validation";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_system_setting"),
    validate(adminValidation.createDepartment),
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
    // checkPermission("view_system_setting"),
    validate(adminValidation.getDepartmentById),
    departmentController.getDepartmentById
  )
  .post(
    auth(),
    // checkPermission("update_system_setting"),
    validate(adminValidation.updateDepartment),
    departmentController.updateDepartment
  )
  .delete(
    auth(),
    checkPermission("delete_system_setting"),
    validate(adminValidation.getDepartmentById),
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
