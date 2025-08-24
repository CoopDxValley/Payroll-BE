import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import shiftService from "./shift.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";
import { validate } from "../../middlewares/validate";
import shiftValidation from "./shift.validation";

const createShift = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shift = await shiftService.createShift({
    ...req.body,
    companyId: user.companyId,
  });

  res
    .status(httpStatus.CREATED)
    .send({ message: "Shift created", data: shift });
});

// const getAllShifts = catchAsync(async (req: Request, res: Response) => {
//   const user = req.employee as AuthEmployee;
//   const shifts = await shiftService.getAllShifts(user.companyId);
//   res.send({ data: shifts, count: shifts.length });
// });

const getAllShifts = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { type } = req.query; // optional param
  console.log(type);
  console.log("fdjkfjdkfjkdkjdfjkkjdfjkdfjk");
  const shifts = await shiftService.getAllShifts(
    user.companyId,
    type as string | undefined
  );
  res.send({ data: shifts, count: shifts.length });
});

const getShiftById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const shift = await shiftService.getShiftById(id);

  if (!shift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Shift not found");
  }

  res.send({ data: shift });
});

const updateShift = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const shift = await shiftService.updateShift(id, req.body);
  res.send({ message: "Shift updated", data: shift });
});

const deleteShift = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await shiftService.deleteShift(id);
  res.send({ message: "Shift deactivated", data: result });
});

export default {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
};
