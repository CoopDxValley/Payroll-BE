import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import allowanceService from "./allowance.service";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreateAllowanceInput,
  UpdateAllowanceInput,
  GetAllowanceByIdParams,
} from "./allowance.type";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync<
  CustomRequest<never, never, CreateAllowanceInput>
>(async (req: CustomRequest<never, never, CreateAllowanceInput>, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const input = {
    ...req.body,
    companyId: authEmployee.companyId,
  };
  const data = await allowanceService.create(input);
  res.status(httpStatus.CREATED).json({ message: "Created", data });
});

export const getAll = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceService.getAll(authEmployee.companyId);
  res.status(httpStatus.OK).json({ message: "Fetched successfully", data });
});

export const getById = catchAsync<
  CustomRequest<GetAllowanceByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceService.getById(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ data });
});

export const update = catchAsync<
  CustomRequest<GetAllowanceByIdParams, never, UpdateAllowanceInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceService.update(req.params.id, {
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.OK).json({ message: "Updated", data });
});

export const remove = catchAsync<
  CustomRequest<GetAllowanceByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceService.remove(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ message: "Deleted", data });
});
