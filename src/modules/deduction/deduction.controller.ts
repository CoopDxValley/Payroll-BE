import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import deductionService from "./deduction.service";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreateDeductionInput,
  UpdateDeductionInput,
  GetDeductionByIdParams,
} from "./deduction.type";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync<
  CustomRequest<never, never, CreateDeductionInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const input = {
    ...req.body,
    companyId: authEmployee.companyId,
  };
  const data = await deductionService.create(input);
  res.status(httpStatus.CREATED).json({ message: "Created", data });
});

export const getAll = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionService.getAll(authEmployee.companyId);
  res.status(httpStatus.OK).json({ message: "Fetched successfully", data });
});

export const getById = catchAsync<
  CustomRequest<GetDeductionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionService.getById(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ data });
});

export const update = catchAsync<
  CustomRequest<GetDeductionByIdParams, never, UpdateDeductionInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionService.update(req.params.id, {
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.OK).json({ message: "Updated", data });
});

export const remove = catchAsync<
  CustomRequest<GetDeductionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionService.remove(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ message: "Deleted", data });
});
