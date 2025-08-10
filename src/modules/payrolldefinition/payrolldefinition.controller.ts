import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import { CustomRequest } from "../../middlewares/validate";
import payrollDefinitionService from "./payrolldefinition.service";
import {
  CreatePayrollDefinitionInput,
  CreatePayrollDefinitionBulkInput,
  GetPayrollDefinitionByIdParams,
  UpdatePayrollDefinitionInput,
} from "./payrolldefinition.type";
import { Response } from "express";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync<
  CustomRequest<never, never, CreatePayrollDefinitionInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await payrollDefinitionService.create({
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.CREATED).send({ message: "Created", data });
});

export const createBulk = catchAsync<
  CustomRequest<never, never, CreatePayrollDefinitionBulkInput>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const result = await payrollDefinitionService.createBulk(
    req.body,
    authEmployee.companyId
  );
  res.status(httpStatus.CREATED).send({
    message: "Successfully defined your payroll.",
    data: result,
  });
});

export const getAll = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await payrollDefinitionService.getAll(authEmployee.companyId);
  res.status(httpStatus.OK).send({ message: "Fetched successfully", data });
});

export const getAllForCurrentYear = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await payrollDefinitionService.getAllForCurrentYear(
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .send({ message: "Fetched successfully", data, count: data.length });
});

export const getCurrentMonth = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await payrollDefinitionService.getCurrentMonth(
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .send({ message: "Fetched successfully", data, count: data.length });
});

export const getLatest = catchAsync(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await payrollDefinitionService.getLatest(authEmployee.companyId);
  res.status(httpStatus.OK).send({ data });
});

export const getById = catchAsync<
  CustomRequest<GetPayrollDefinitionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await payrollDefinitionService.getById(
    req.params.id,
    authEmployee.companyId
  );
  res.status(httpStatus.OK).send({ data });
});

export const update = catchAsync<
  CustomRequest<
    GetPayrollDefinitionByIdParams,
    never,
    UpdatePayrollDefinitionInput
  >
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await payrollDefinitionService.update(req.params.id, {
    ...req.body,
    companyId: authEmployee.companyId,
  });
  res.status(httpStatus.OK).send({ message: "Updated", data });
});

export const remove = catchAsync<
  CustomRequest<GetPayrollDefinitionByIdParams, never, never>
>(async (req, res) => {
  const authEmployee = req.employee as AuthEmployee;
  await payrollDefinitionService.remove(req.params.id, authEmployee.companyId);
  res.status(httpStatus.OK).send({ message: "Deleted" });
});
