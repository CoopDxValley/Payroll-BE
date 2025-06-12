import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import * as companyService from "./company.services";
import { CreateCompanyInput } from "./company.type";

export const registerCompany = catchAsync(async (req, res) => {
  const input: CreateCompanyInput = req.body;
  const company = await companyService.createCompany(input);
  res
    .status(httpStatus.CREATED)
    .send({ data: company, message: "Company created successfully!" });
});
