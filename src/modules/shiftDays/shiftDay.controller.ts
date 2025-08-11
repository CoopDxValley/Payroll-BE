import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import shiftDayService from "./shiftDay.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";

const createShiftDay = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftDay = await shiftDayService.createShiftDay({
    ...req.body,
    companyId: user.companyId,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Shift day created", data: shiftDay });
});

const getAllShiftDays = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { shiftId } = req.query;

  const shiftDays = await shiftDayService.getAllShiftDays(
    user.companyId,
    shiftId as string
  );
  res.send({ data: shiftDays, count: shiftDays.length });
});

const getShiftDayById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const shiftDay = await shiftDayService.getShiftDayById(id);

  if (!shiftDay) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift day not found");
  }

  res.send({ data: shiftDay });
});

const updateShiftDay = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const shiftDay = await shiftDayService.updateShiftDay(id, req.body);
  res.send({ message: "Shift day updated", data: shiftDay });
});

const deleteShiftDay = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  console.log("dfdfkdkd");
  // print(id);
  console.log(id)
  const result = await shiftDayService.deleteShiftDay(id);
  res.send({ message: "Shift day deleted", data: result });
});

export default {
  createShiftDay,
  getAllShiftDays,
  getShiftDayById,
  updateShiftDay,
  deleteShiftDay,
};
