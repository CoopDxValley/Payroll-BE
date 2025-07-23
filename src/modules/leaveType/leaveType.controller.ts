import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import leaveTypeService from "./leaveType.service";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";

const createLeaveType = catchAsync(async (req: Request, res: Response) => {
  const leaveType = await leaveTypeService.createLeaveType(req.body);
  res.status(httpStatus.CREATED).send({
    message: "Leave type created",
    data: leaveType,
  });
});

const getAllLeaveTypes = catchAsync(async (_req: Request, res: Response) => {
  const leaveTypes = await leaveTypeService.getAllLeaveTypes();
  res.send({ data: leaveTypes, count: leaveTypes.length });
});

const getLeaveTypeById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const leaveType = await leaveTypeService.getLeaveTypeById(id);

  if (!leaveType) {
    throw new ApiError(httpStatus.NOT_FOUND, "Leave type not found");
  }

  res.send({ data: [leaveType] });
});

const updateLeaveType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const leaveType = await leaveTypeService.updateLeaveType(id, req.body);
  res.send({ message: "Leave type updated", data: leaveType });
});

const deleteLeaveType = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await leaveTypeService.deleteLeaveType(id);
  res.send({ message: "Leave type deleted", data: updated });
});

export default {
  createLeaveType,
  getAllLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
};
