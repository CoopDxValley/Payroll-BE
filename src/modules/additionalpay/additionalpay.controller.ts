import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import additionalPayService from "./additionalpay.service";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreateAdditionalPayInput,
  UpdateAdditionalPayInput,
  GetAdditionalPayByIdParams,
} from "./additionalpay.type";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync<
  CustomRequest<never, never, CreateAdditionalPayInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalPayService.create({
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res
    .status(httpStatus.CREATED)
    .json({ message: "additional pay created", data });
});

export const getAll = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalPayService.getAll(authEmployee.companyId);
  res
    .status(httpStatus.OK)
    .json({ message: "additional pay fetched successfully", data });
});

export const getById = catchAsync<
  CustomRequest<GetAdditionalPayByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalPayService.getById(
    req.params.id,
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .json({ data, message: "additional pay fetched successfully" });
});

export const update = catchAsync<
  CustomRequest<GetAdditionalPayByIdParams, never, UpdateAdditionalPayInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalPayService.update(req.params.id, {
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.OK).json({ message: "additional pay updated", data });
});

export const remove = catchAsync<
  CustomRequest<GetAdditionalPayByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalPayService.remove(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ message: "additional pay removed", data });
});
