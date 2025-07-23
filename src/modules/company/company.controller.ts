import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import * as companyService from "./company.services";
import { CreateCompanyInput, UpdateCompanyInput } from "./company.type";
import { AuthEmployee } from "../auth/auth.type";
import ApiError from "../../utils/api-error";

export const registerCompany = catchAsync(async (req, res) => {
  const input: CreateCompanyInput = req.body;
  const company = await companyService.createCompany(input);
  res
    .status(httpStatus.CREATED)
    .send({ data: company, message: "Company created successfully!" });
});

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

export const updateCompany = catchAsync(async (req, res) => {
  const employee = req.employee as AuthEmployee;

  if (!employee.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "No company assigned");
  }

  // const { organizationName, phoneNumber, email, notes, level } = req.body;
  const input: UpdateCompanyInput = req.body;
  const { organizationName, phoneNumber, email, notes } = input;

  const updates: any = {};

  if (organizationName) updates.organizationName = organizationName;
  if (phoneNumber) updates.phoneNumber = phoneNumber;
  if (email) updates.email = email;
  if (notes) updates.notes = notes;

  const company = await companyService.updateCompanyProfile(
    employee.companyId,
    updates
  );

  res.status(httpStatus.OK).json({
    message: "Company updated successfully",
    data: company,
  });
});
