import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import allowanceDefinitionService from "./allowanceDefinition.service";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreateAllowanceDefinitionInput,
  UpdateAllowanceDefinitionInput,
  GetAllowanceDefinitionByIdParams,
} from "./allowanceDefinition.type";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync<
  CustomRequest<never, never, CreateAllowanceDefinitionInput>
>(async (req, res) => {
  const input: CreateAllowanceDefinitionInput & { companyId: string } = {
    ...req.body,
    companyId: (req.employee as AuthEmployee).companyId,
  };
  const data = await allowanceDefinitionService.create(input);
  res.status(httpStatus.CREATED).json({ message: "Created", data });
});

export const getAll = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceDefinitionService.getAll(authEmployee.companyId);
  res.status(httpStatus.OK).json({ message: "Fetched successfully", data });
});

export const getById = catchAsync<
  CustomRequest<GetAllowanceDefinitionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceDefinitionService.getById(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ data });
});

export const update = catchAsync<
  CustomRequest<
    GetAllowanceDefinitionByIdParams,
    never,
    UpdateAllowanceDefinitionInput
  >
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceDefinitionService.update(req.params.id, {
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.OK).json({ message: "Updated", data });
});

export const remove = catchAsync<
  CustomRequest<GetAllowanceDefinitionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await allowanceDefinitionService.remove(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).json({ message: "Deleted", data });
});
