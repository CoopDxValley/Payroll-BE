import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import deductionDefinitionService from "./deductiondefinition.service";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreateDeductionDefinitionInput,
  UpdateDeductionDefinitionInput,
  GetDeductionDefinitionByIdParams,
} from "./deductiondefinition.type";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync<
  CustomRequest<never, never, CreateDeductionDefinitionInput>
>(async (req, res) => {
  const input: CreateDeductionDefinitionInput & { companyId: string } = {
    ...req.body,
    companyId: (req.employee as AuthEmployee).companyId,
  };
  const data = await deductionDefinitionService.create(input);
  res.status(httpStatus.CREATED).json({ message: "Created", data });
});

export const getAll = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionDefinitionService.getAll(authEmployee.companyId);
  res.status(httpStatus.OK).json({ message: "Fetched successfully", data });
});

export const getById = catchAsync<
  CustomRequest<GetDeductionDefinitionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionDefinitionService.getById(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ data });
});

export const update = catchAsync<
  CustomRequest<
    GetDeductionDefinitionByIdParams,
    never,
    UpdateDeductionDefinitionInput
  >
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionDefinitionService.update(req.params.id, {
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.OK).json({ message: "Updated", data });
});

export const remove = catchAsync<
  CustomRequest<GetDeductionDefinitionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await deductionDefinitionService.remove(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ message: "Deleted", data });
});
