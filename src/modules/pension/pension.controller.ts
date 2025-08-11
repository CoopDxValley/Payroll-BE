import { Response } from "express";
import httpStatus from "http-status";
import pensionService from "./pension.service";
import catchAsync from "../../utils/catch-async";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreatePensionInput,
  PensionParams,
  UpdatePensionInput,
} from "./pension.type";
import { UUID } from "crypto";

const createPension = catchAsync<
  CustomRequest<never, never, CreatePensionInput>
>(
  async (
    req: CustomRequest<never, never, CreatePensionInput>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: CreatePensionInput & { companyId: string } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    const pension = await pensionService.addCompanyPension(inputData);

    res.status(httpStatus.CREATED).send({
      message: "Pension added successfully",
      data: pension,
    });
  }
);

const getDefaultPension = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const pension = await pensionService.getDefaultPension();

    res.status(httpStatus.OK).send({
      data: pension,
      message: "Pension retrieved successfully",
    });
  }
);

const getCompanyPension = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const pension = await pensionService.getCompanyPension(
      authEmployee.companyId
    );

    res.status(httpStatus.OK).send({
      data: pension,
      message: "Pension retrieved successfully",
    });
  }
);

const removeCompanyPension = catchAsync<
  CustomRequest<PensionParams, never, never>
>(async (req: CustomRequest<PensionParams, never, never>, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const { ruleId } = req.params;
  const pension = await pensionService.removeCompanyPensionRule(ruleId);

  res.status(httpStatus.OK).send({
    data: pension,
    message: "Pension removed successfully",
  });
});

const resetCompanyPensionRules = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const pension = await pensionService.resetCompanyPensionRules(
      authEmployee.companyId
    );

    res.status(httpStatus.OK).send({
      data: pension,
      message: "Pension reset to default successfully",
    });
  }
);

const assignDefaultPensionFundsToCompany = catchAsync<
  CustomRequest<never, never, never>
>(async (req: CustomRequest<never, never, never>, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const pension = await pensionService.assignDefaultPensionFundsToCompany(
    authEmployee.companyId
  );

  res.status(httpStatus.OK).send({
    data: pension,
    message: "Default pension fund assigned successfully",
  });
});

const fetchPensionById = catchAsync<CustomRequest<PensionParams, never, never>>(
  async (req: CustomRequest<PensionParams, never, never>, res: Response) => {
    const { ruleId } = req.params;
    const pension = await pensionService.getPensionFundById(ruleId);

    res.status(httpStatus.OK).send({
      data: pension,
      message: "Pension retrieved successfully",
    });
  }
);

const update = catchAsync<
  CustomRequest<PensionParams, never, CreatePensionInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const input: CreatePensionInput & { companyId: string } = {
    ...req.body,
    companyId: authEmployee.companyId,
  };
  const data = await pensionService.update(req.params.ruleId, input);
  res.status(httpStatus.OK).json({ message: "Updated", data });
});

export default {
  createPension,
  getDefaultPension,
  getCompanyPension,
  removeCompanyPension,
  resetCompanyPensionRules,
  assignDefaultPensionFundsToCompany,
  fetchPensionById,
  update,
};
