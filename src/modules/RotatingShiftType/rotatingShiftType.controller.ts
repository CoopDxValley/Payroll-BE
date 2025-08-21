import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import rotatingShiftTypeService from "./rotatingShiftType.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";

const createRotatingShiftType = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  
  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftType = await rotatingShiftTypeService.createRotatingShiftType({
    ...req.body,
    companyId: user.companyId,
  });

  res.status(httpStatus.CREATED).send({
    message: "Rotating shift type created successfully",
    data: shiftType,
  });
});

const getRotatingShiftTypes = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { isActive, name } = req.query;

  const filters: any = {};
  if (isActive !== undefined) filters.isActive = isActive === "true";
  if (name) filters.name = name;

  const shiftTypes = await rotatingShiftTypeService.getRotatingShiftTypes(
    user.companyId,
    filters
  );

  res.send({
    data: shiftTypes,
    count: shiftTypes.length,
  });
});

const getRotatingShiftTypeById = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftType = await rotatingShiftTypeService.getRotatingShiftTypeById(
    id,
    user.companyId
  );

  res.send({ data: shiftType });
});

const updateRotatingShiftType = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftType = await rotatingShiftTypeService.updateRotatingShiftType(
    id,
    user.companyId,
    req.body
  );

  res.send({
    message: "Rotating shift type updated successfully",
    data: shiftType,
  });
});

const deleteRotatingShiftType = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const result = await rotatingShiftTypeService.deleteRotatingShiftType(
    id,
    user.companyId
  );

  res.send({
    message: result.message,
    data: result,
  });
});

const deactivateRotatingShiftType = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftType = await rotatingShiftTypeService.deactivateRotatingShiftType(
    id,
    user.companyId
  );

  res.send({
    message: "Rotating shift type deactivated successfully",
    data: shiftType,
  });
});

const activateRotatingShiftType = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftType = await rotatingShiftTypeService.activateRotatingShiftType(
    id,
    user.companyId
  );

  res.send({
    message: "Rotating shift type activated successfully",
    data: shiftType,
  });
});

export default {
  createRotatingShiftType,
  getRotatingShiftTypes,
  getRotatingShiftTypeById,
  updateRotatingShiftType,
  deleteRotatingShiftType,
  deactivateRotatingShiftType,
  activateRotatingShiftType,
}; 