import { Response } from "express";
import httpStatus from "http-status";
import { CustomRequest } from "../../middlewares/validate";
import catchAsync from "../../utils/catch-async";
import { createPayrollInput } from "./payroll.type";
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

    res.status(httpStatus.CREATED).send({
      message: "Payroll Create Successfully",
      data: {
        payroll,
        // expectedHours: expectedHours,
        // workingHours: workingHours,
      },
    });
  }
);

export default { createPayroll };
