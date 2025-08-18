import httpStatus from "http-status";
import { Response } from "express";
import {
  CreateIdFormatInput,
  UpdateIdFormatBody,
  UpdateIdFormatParams,
  GetOrDeleteIdFormatParams,
} from "./IdFormat.type";
import * as idFormatService from "./IdFormat.service";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import catchAsync from "../../utils/catch-async";

// POST /id-formats
export const createIdFormat = catchAsync<
  CustomRequest<never, never, CreateIdFormatInput>
>(async (req, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const payload: CreateIdFormatInput & { companyId: string } = {
    ...req.body,
    companyId: authEmployee.companyId,
  };

  const idFormat = await idFormatService.createIdFormat(payload);

  res
    .status(httpStatus.CREATED)
    .send({ message: "Id format created successfully", data: idFormat });
});

// GET /id-formats
export const getAllCompanyIdFormats = catchAsync<
  CustomRequest<never, never, never>
>(async (req, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await idFormatService.getCompanyIdFormats(
    authEmployee.companyId
  );
  res.status(httpStatus.OK).send({ message: "Id formats", data });
});

// PATCH /id-formats/:id
export const updateIdFormat = catchAsync<
  CustomRequest<UpdateIdFormatParams, never, UpdateIdFormatBody>
>(async (req, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const { id } = req.params;

  const updated = await idFormatService.updateIdFormat(
    authEmployee.companyId,
    id,
    req.body
  );

  res
    .status(httpStatus.OK)
    .send({ message: "Id format updated successfully", data: updated });
});

// DELETE /id-formats/:id
export const deleteIdFormat = catchAsync<
  CustomRequest<GetOrDeleteIdFormatParams>
>(async (req, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const { id } = req.params;

  const result = await idFormatService.deleteIdFormatById(
    authEmployee.companyId,
    id
  );
  res.status(httpStatus.OK).send(result);
});

// GET /id-formats/active
export const getActiveCompanyIdFormat = catchAsync<
  CustomRequest<never, never, never>
>(async (req, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await idFormatService.getActiveIdFormatForCompany(
    authEmployee.companyId
  );
  res.status(httpStatus.OK).send({ message: "Active Id format", data });
});
