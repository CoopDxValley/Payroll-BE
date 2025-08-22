import { Router } from "express";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  assignEmployeeToDepartmentSchema,
  assignEmployeeToPositionSchema,
  createEmployeeValidation,
  employeeSearchSchema,
  generatePasswordSchema,
  getEmployeeSchema,
  getEmployeesSchema,
} from "./employee.validation";
import * as employeeController from "./employee.controller";
import {
  AssignEmployeeToDepartmentBody,
  AssignEmployeeToPositionBody,
  EmployeeSearchQuery,
  GeneratePasswordInput,
  GetEmployeeInfoByIdParams,
  getEmployeesQuery,
} from "./employee.type";

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
    validate<never, getEmployeesQuery, never>(getEmployeesSchema),
    employeeController.getEmployees
  );

router
  .route("/:employeeId")
  .get(
    auth(),
    validate<GetEmployeeInfoByIdParams, never, never>(getEmployeeSchema),
    employeeController.getEmployeeInfoById
  );

router
  .route("/assign-department")
  .post(
    auth(),
    validate<never, never, AssignEmployeeToDepartmentBody>(
      assignEmployeeToDepartmentSchema
    ),
    employeeController.assignEmployeeToDepartment
  );

router
  .route("/assign-position")
  .post(
    auth(),
    validate<never, never, AssignEmployeeToPositionBody>(
      assignEmployeeToPositionSchema
    ),
    employeeController.assignEmployeeToPosition
  );

router.route("/generate-password").post(
  auth(),
  validate<never, never, GeneratePasswordInput>({
    body: generatePasswordSchema,
  }),
  employeeController.generatePassword
);

router.route("/seach/keyword/employee").get(
  auth(),
  validate<never, EmployeeSearchQuery, never>({
    query: employeeSearchSchema.query,
  }),
  employeeController.searchEmployees
);

router
  .route("/download/template/employee-sheets")
  .get(auth(), employeeController.downloadEmployeeSheets);

export default router;
