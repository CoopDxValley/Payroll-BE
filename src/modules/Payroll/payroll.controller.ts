import { Response } from "express";
import httpStatus from "http-status";
import { CustomRequest } from "../../middlewares/validate";
import catchAsync from "../../utils/catch-async";
import {
  createPayrollInput,
  getPayrollByPayrollDefinitionId,
} from "./payroll.type";
import { AuthEmployee } from "../auth/auth.type";
import payrollService from "./payroll.services";

const createPayroll = catchAsync<
  CustomRequest<never, never, createPayrollInput>
>(
  async (
    req: CustomRequest<never, never, createPayrollInput>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: createPayrollInput & { companyId: string } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    const payroll = await payrollService.createPayroll(inputData);

    res
      .status(httpStatus.CREATED)
      .send({ message: "Payroll Create Successfully", data: payroll });
  }
);

const getCurrentMonthPayroll = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const payrolls = await payrollService.getCurrentMonthPayroll(
      authEmployee.companyId
    );
    res.status(httpStatus.OK).send({
      data: payrolls,
      message: "Current month payroll retrieved successfully",
    });
  }
);

const getPayrollByPayrollDefinitionId = catchAsync<
  CustomRequest<getPayrollByPayrollDefinitionId, never, never>
>(
  async (
    req: CustomRequest<getPayrollByPayrollDefinitionId, never, never>,
    res: Response
  ) => {
    const payrolls = await payrollService.getPayrollByPayrollDefinitionId(
      req.params.id
    );
    res
      .status(httpStatus.OK)
      .send({ data: payrolls, message: "Payroll retrieved successfully" });
  }
);

const getNonPayrollEmployee = catchAsync<
  CustomRequest<never, getPayrollByPayrollDefinitionId, never>
>(
  async (
    req: CustomRequest<never, getPayrollByPayrollDefinitionId, never>,
    res: Response
  ) => {
    const validate = req.validatedQuery as getPayrollByPayrollDefinitionId;
    const nonPayrollEmployees = await payrollService.getNonPayrollEmployee(
      validate.id
    );
    res.status(httpStatus.OK).send({
      data: nonPayrollEmployees,
      message: "Non-payroll employees retrieved successfully",
    });
  }
);

const getPayrollSetup = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const payrollSetup = await payrollService.getPayrollSetup(
      authEmployee.companyId
    );
    res.status(httpStatus.OK).send({
      data: payrollSetup,
      message: "Payroll setup retrieved successfully",
    });
  }
);

const getPayrollProcess = catchAsync<
  CustomRequest<getPayrollByPayrollDefinitionId, never, never>
>(
  async (
    req: CustomRequest<getPayrollByPayrollDefinitionId, never, never>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const { id } = req.params;
    const payrollProcess = await payrollService.getPayrollProcess(
      authEmployee.companyId,
      id
    );
    res.status(httpStatus.OK).send({
      data: payrollProcess,
      message: "Payroll process retrieved successfully",
    });
  }
);

const getPayrollPayment = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const payrollPayments = await payrollService.getPayrollPayment(
      authEmployee.companyId
    );
    res.status(httpStatus.OK).send({
      data: payrollPayments,
      message: "Payroll payments retrieved successfully",
    });
  }
);

const makePayrollPayment = catchAsync<
  CustomRequest<getPayrollByPayrollDefinitionId, never, never>
>(
  async (
    req: CustomRequest<getPayrollByPayrollDefinitionId, never, never>,
    res: Response
  ) => {
    const { id } = req.params;
    // const result = await payrollService.makePayrollPayment(id);
    // res.status(httpStatus.OK).send({
    //   data: result,
    //   message: "Payment processed successfully",
    // });
  }
);

export default {
  createPayroll,
  getCurrentMonthPayroll,
  getPayrollByPayrollDefinitionId,
  getNonPayrollEmployee,
  getPayrollSetup,
  getPayrollProcess,
  getPayrollPayment,
  makePayrollPayment,
};
