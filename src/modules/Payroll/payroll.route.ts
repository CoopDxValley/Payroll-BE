import express from "express";
import payrollController from "./payroll.controller";
import {
  createPayrollSchema,
  getNonPayrollEmployeeSchema,
  getPayrollByPayrollDefinitionIdSchema,
} from "./payroll.validation";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import {
  createPayrollInput,
  getNonPayrollEmployee,
  getPayrollByPayrollDefinitionId,
} from "./payroll.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, createPayrollInput>(createPayrollSchema),
    payrollController.createPayroll
  );

// router.get("/current-month", auth(), payrollController.getCurrentMonthPayroll);

// router.get(
//   "/definition/:id",
//   auth(),
//   validate<getPayrollByPayrollDefinitionId, never, never>(
//     getPayrollByPayrollDefinitionIdSchema
//   ),
//   payrollController.getPayrollByPayrollDefinitionId
// );

// router.get(
//   "/non-payroll-employees",
//   auth(),
//   validate<never, getNonPayrollEmployee, never>(getNonPayrollEmployeeSchema),
//   payrollController.getNonPayrollEmployee
// );

export default router;
