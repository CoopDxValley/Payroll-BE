import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import shiftService from "./shift.service";
import { AuthEmployee } from "../auth/auth.type";

const createShift = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const shift = await shiftService.createShift(req.body, user.companyId);
  res
    .status(httpStatus.CREATED)
    .send({ message: "Shift created successfully", data: shift });
});

const getShifts = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const shifts = await shiftService.getShifts(user.companyId);
  res.status(httpStatus.OK).send({ data: shifts });
});

const getShiftById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const { id } = req.params;
  const shift = await shiftService.getShiftById(id, user.companyId);
  res.status(httpStatus.OK).send({ data: shift });
});

const updateShift = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const { id } = req.params;
  const shift = await shiftService.updateShift(id, user.companyId, req.body);
  res
    .status(httpStatus.OK)
    .send({ message: "Shift updated successfully", data: shift });
});

const deleteShift = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const { id } = req.params;
  await shiftService.deleteShift(id, user.companyId);
  res.status(httpStatus.OK).send({ message: "Shift deleted successfully" });
});

export default {
  createShift,
  getShifts,
  getShiftById,
  updateShift,
  deleteShift,
};
