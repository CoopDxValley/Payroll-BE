import { Response } from "express";
import httpStatus from "http-status";
import taxslabService from "./taxslab.service";
import catchAsync from "../../utils/catch-async";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import { CreateTaxslabInput, TaxslabParams } from "./taxslab.type";

const createTaxslab = catchAsync<
  CustomRequest<never, never, CreateTaxslabInput>
>(
  async (
    req: CustomRequest<never, never, CreateTaxslabInput>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: CreateTaxslabInput & { companyId: string } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    const taxslab = await taxslabService.addCompanyTaxslab(inputData);

    res
      .status(httpStatus.CREATED)
      .send({ message: "Taxslab addedd successfully", data: taxslab });
  }
);

const getDefaultTaxslab = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const taxslab = await taxslabService.getDefaultTaxSlab();

    res
      .status(httpStatus.OK)
      .send({ data: taxslab, message: "Taxslab retrieved successfully" });
  }
);

const getCompanyTaxRules = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const taxslab = await taxslabService.getCompanyTaxRules(
      authEmployee.companyId
    );

    res
      .status(httpStatus.OK)
      .send({ data: taxslab, message: "Taxslab retrieved successfully" });
  }
);

const removeCompanyTaxslab = catchAsync<
  CustomRequest<TaxslabParams, never, never>
>(async (req: CustomRequest<TaxslabParams, never, never>, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const { ruleId } = req.params;
  const taxslab = await taxslabService.removeCompanyTaxRule(
    authEmployee.companyId,
    ruleId
  );

  res
    .status(httpStatus.OK)
    .send({ data: taxslab, message: "Taxslab removed successfully" });
});

const resetCompanyTaxslab = catchAsync<CustomRequest<never, never, never>>(
  async (req: CustomRequest<never, never, never>, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const taxslab = await taxslabService.resetCompanyTaxRules(
      authEmployee.companyId
    );

    res.status(httpStatus.OK).send({
      data: taxslab,
      message: "Taxslab reset to default successfully",
    });
  }
);

const assignDefaultTaxRulesToCompany = catchAsync<
  CustomRequest<never, never, never>
>(async (req: CustomRequest<never, never, never>, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const taxslab = await taxslabService.assignDefaultTaxRulesToCompany(
    authEmployee.companyId
  );

  res.status(httpStatus.OK).send({
    data: taxslab,
    message: "default taxslab assigned successfully",
  });
});

const fetchTaxslabById = catchAsync<CustomRequest<TaxslabParams, never, never>>(
  async (req: CustomRequest<TaxslabParams, never, never>, res: Response) => {
    const { ruleId } = req.params;
    const taxslab = await taxslabService.getTaxslabById(ruleId);

    res
      .status(httpStatus.OK)
      .send({ data: taxslab, message: "Taxslab removed successfully" });
  }
);

export default {
  createTaxslab,
  getDefaultTaxslab,
  getCompanyTaxRules,
  removeCompanyTaxslab,
  resetCompanyTaxslab,
  assignDefaultTaxRulesToCompany,
  fetchTaxslabById,
};
