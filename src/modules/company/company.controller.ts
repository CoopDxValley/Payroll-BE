import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import * as companyService from "./company.services";
import { CreateCompanyInput, UpdateCompanyInput } from "./company.type";
import { AuthEmployee } from "../auth/auth.type";
import ApiError from "../../utils/api-error";
import { CustomRequest } from "../../middlewares/validate";

export const registerCompany = catchAsync<
  CustomRequest<never, never, CreateCompanyInput>
>(
  async (
    req: CustomRequest<never, never, CreateCompanyInput>,
    res: Response
  ) => {
    const input = req.body;
    const company = await companyService.createCompany(input);
    res
      .status(httpStatus.CREATED)
      .send({ data: company, message: "Company created successfully!" });
  }
);

export const getCompany = catchAsync(async (req, res) => {
  const employee = req.employee as AuthEmployee;

  if (!employee?.companyId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Employee has no company assigned"
    );
  }

  const company = await companyService.getCompanyProfile(employee.companyId);

  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  res.status(httpStatus.OK).send({
    data: company,
    message: "Company retrieved successfully",
  });
});

export const updateCompany = catchAsync<
  CustomRequest<never, never, UpdateCompanyInput>
>(async (req, res) => {
  const employee = req.employee as AuthEmployee;
  const input = req.body;

  if (!employee.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No company assigned");
  }

  const company = await companyService.updateCompanyProfile(
    employee.companyId,
    input
  );

  res.status(httpStatus.OK).json({
    message: "Company updated successfully",
    data: company,
  });
});
