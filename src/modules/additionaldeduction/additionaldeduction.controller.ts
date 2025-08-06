import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import additionalDeductionService from "./additionaldeduction.service";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreateAdditionalDeductionInput,
  UpdateAdditionalDeductionInput,
  GetAdditionalDeductionByIdParams,
} from "./additionaldeduction.type";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync<
  CustomRequest<never, never, CreateAdditionalDeductionInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalDeductionService.create({
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.CREATED).json({ message: "Created", data });
});

export const getAll = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalDeductionService.getAll(authEmployee.companyId);
  res.status(httpStatus.OK).json({ message: "Fetched successfully", data });
});

export const getById = catchAsync<
  CustomRequest<GetAdditionalDeductionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalDeductionService.getById(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ data, message: "Fetched successfully" });
});

export const update = catchAsync<
  CustomRequest<
    GetAdditionalDeductionByIdParams,
    never,
    UpdateAdditionalDeductionInput
  >
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalDeductionService.update(req.params.id, {
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res
    .status(httpStatus.OK)
    .json({ message: "additional deduction updated", data });
});

export const remove = catchAsync<
  CustomRequest<GetAdditionalDeductionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalDeductionService.remove(
    req.params.id,
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .json({ message: "removed additional deduction", data });
});
