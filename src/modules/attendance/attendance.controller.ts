import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import attendanceService from "./attendance.service";
import { AuthEmployee } from "../auth/auth.type";

const createAttendance = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;

  const log = await attendanceService.createAttendance({
    ...req.body,
    employeeId: user.id,
  });

  res.status(httpStatus.CREATED).json({
    message: "Attendance logged",
    data: log,
  });
});

const getAllAttendanceLogs = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;

  const logs = await attendanceService.getAllAttendanceLogs(user.id);

  res.json({ data: logs, count: logs.length });
});

const getAttendanceById = catchAsync(async (req: Request, res: Response) => {
  const log = await attendanceService.getAttendanceById(req.params.id);
  if (!log) {
    res.status(httpStatus.NOT_FOUND).json({ message: "Attendance not found" });
    return;
  }
  res.json({ data: log });
});

export default {
  createAttendance,
  getAllAttendanceLogs,
  getAttendanceById,
};
