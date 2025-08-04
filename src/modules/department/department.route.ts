import express from "express";
import departmentController from "./department.controller";
import auth from "../../middlewares/auth";
import { checkPermission } from "../../middlewares/check-permissions";
import { validate } from "../../middlewares/validate";
import adminValidation from "./department.validation";
import {
  createDepartmentInput,
  getDepartmentByIdParams,
  updateDepartmentBody,
  updateDepartmentParams,
} from "./department.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    // checkPermission("create_system_setting"),
    validate<never, never, createDepartmentInput>(
      adminValidation.createDepartment
    ),
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
    validate<getDepartmentByIdParams, never, never>(
      adminValidation.getDepartmentById
    ),
    departmentController.getDepartmentById
  )
  .post(
    auth(),
    // checkPermission("update_system_setting"),
    validate<updateDepartmentParams, never, updateDepartmentBody>(
      adminValidation.updateDepartment
    ),
    departmentController.updateDepartment
  );

router
  .route("/delete/:id")
  .post(
    auth(),
    checkPermission("delete_system_setting"),
    validate<getDepartmentByIdParams, never, never>(
      adminValidation.getDepartmentById
    ),
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
