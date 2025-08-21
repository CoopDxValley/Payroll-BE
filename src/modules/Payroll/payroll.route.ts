import express from "express";
import payrollController from "./payroll.controller";
import { createPayrollSchema } from "./payroll.validation";
import auth from "../../middlewares/auth";
import { validate } from "../../middlewares/validate";
import { createPayrollInput } from "./payroll.type";

const router = express.Router();

router
  .route("/")
  .post(
    auth(),
    validate<never, never, createPayrollInput>(createPayrollSchema),
    payrollController.createPayroll
  );

export default router;
