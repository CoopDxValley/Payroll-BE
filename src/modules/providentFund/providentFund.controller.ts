import { Response } from "express";
import httpStatus from "http-status";
import providentFundService from "./providentFund.service";
import catchAsync from "../../utils/catch-async";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreateProvidentFundInput,
  ProvidentFundParams,
} from "./providentFund.type";

const createProvidentFund = catchAsync<
  CustomRequest<never, never, CreateProvidentFundInput>
>(
  async (
    req: CustomRequest<never, never, CreateProvidentFundInput>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: CreateProvidentFundInput & { companyId: string } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    const providentFund = await providentFundService.addCompanyProvidentFund(
      inputData
    );

    res.status(httpStatus.CREATED).send({
      message: "Provident Fund added successfully",
      data: providentFund,
    });
  }
);

const getDefaultProvidentFund = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const providentFund = await providentFundService.getDefaultProvidentFund();

    res.status(httpStatus.OK).send({
      data: providentFund,
      message: "Provident Fund retrieved successfully",
    });
  }
);

const getCompanyProvidentFund = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const providentFund = await providentFundService.getCompanyProvidentFund(
      authEmployee.companyId
    );

    res.status(httpStatus.OK).send({
      data: providentFund,
      message: "Provident Fund retrieved successfully",
    });
  }
);

const removeCompanyProvidentFund = catchAsync<
  CustomRequest<ProvidentFundParams, never, never>
>(
  async (
    req: CustomRequest<ProvidentFundParams, never, never>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const { ruleId } = req.params;
    const providentFund =
      await providentFundService.removeCompanyProvidentFundRule(
        authEmployee.companyId,
        ruleId
      );

    res.status(httpStatus.OK).send({
      data: providentFund,
      message: "Provident Fund removed successfully",
    });
  }
);

const resetCompanyProvidentFundRules = catchAsync<
  CustomRequest<never, never, never>
>(async (req: CustomRequest<never, never, never>, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const providentFund =
    await providentFundService.resetCompanyProvidentFundRules(
      authEmployee.companyId
    );

  res.status(httpStatus.OK).send({
    data: providentFund,
    message: "Provident Fund reset to default successfully",
  });
});

const assignDefaultProvidentFundsToCompany = catchAsync<
  CustomRequest<never, never, never>
>(async (req: CustomRequest<never, never, never>, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const providentFund =
    await providentFundService.assignDefaultProvidentFundsToCompany(
      authEmployee.companyId
    );

  res.status(httpStatus.OK).send({
    data: providentFund,
    message: "default provident fund assigned successfully",
  });
});

const fetchProvidentFundById = catchAsync<
  CustomRequest<ProvidentFundParams, never, never>
>(
  async (
    req: CustomRequest<ProvidentFundParams, never, never>,
    res: Response
  ) => {
    const { ruleId } = req.params;
    const providentFund = await providentFundService.getProvidentFundById(
      ruleId
    );

    res.status(httpStatus.OK).send({
      data: providentFund,
      message: "Provident Fund retrieved successfully",
    });
  }
);

export default {
  createProvidentFund,
  getDefaultProvidentFund,
  getCompanyProvidentFund,
  removeCompanyProvidentFund,
  resetCompanyProvidentFundRules,
  assignDefaultProvidentFundsToCompany,
  fetchProvidentFundById,
};
