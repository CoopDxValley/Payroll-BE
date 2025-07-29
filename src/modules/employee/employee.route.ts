import { Router } from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  getEmployeeValidation,
  createEmployeeValidation,
  getEmployeesValidation,
  assignEmployeeToDepartmentValidation,
  assignEmployeeToPositionValidation,
} from "./employee.validation";
import * as employeeController from "./employee.controller";

const router = Router();

router
  .route("/")
  .post(
    auth(),
    validate(createEmployeeValidation),
    employeeController.registerEmployee
  )
  .get(
    auth(),
    validate(getEmployeesValidation),
    employeeController.getEmployees
  );

router
  .route("/:employeeId")
  .get(
    auth(),
    validate(getEmployeeValidation),
    employeeController.getEmployeeInfoById
  );

router
  .route("/assign-department")
  .post(
    auth(),
    validate(assignEmployeeToDepartmentValidation),
    employeeController.assignEmployeeToDepartment
  );

router
  .route("/assign-position")
  .post(
    auth(),
    validate(assignEmployeeToPositionValidation),
    employeeController.assignEmployeeToPosition
  );

export default router;
