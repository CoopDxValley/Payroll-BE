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

  const logs = await attendanceService.getAllAttendanceLogs();

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

const bulkDeviceRegistration = catchAsync(
  async (req: Request, res: Response) => {
    const { records } = req.body;

    const result = await attendanceService.bulkDeviceRegistration(records);

    res.status(httpStatus.CREATED).json({
      message: "Bulk attendance registration completed",
      ...result,
    });
  }
);

const getAttendanceByDateRange = catchAsync(
  async (req: Request, res: Response) => {
    const { startDate, endDate, employeeId } = req.query;
    console.log("dfjdkfhdkfdfkddkfkdfk");
    const logs = await attendanceService.getAttendanceByDateRange(
      startDate as string,
      endDate as string,
      employeeId as string | undefined
    );

    res.json({
      data: logs,
      count: logs.length,
      dateRange: {
        startDate,
        endDate,
      },
    });
  }
);

const getAttendanceByDate = catchAsync(async (req: Request, res: Response) => {
  const { date, employeeId } = req.query;

  const logs = await attendanceService.getAttendanceByDate(
    date as string,
    employeeId as string | undefined
  );

  res.json({
    data: logs,
    count: logs.length,
    date: date,
  });
});

const getAttendanceSummary = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, employeeId } = req.query;

  const summary = await attendanceService.getAttendanceSummary(
    startDate as string,
    endDate as string,
    employeeId as string | undefined
  );

  res.json({ message: "Fetched successfully", data: summary });
});

const getTodaysAttendace = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, employeeId } = req.query;

  const summary = await attendanceService.getTodaysAttendance();
  res.json({ message: "Fetched successfully", data: summary });
});

const getWeeklyAttendance = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, employeeId } = req.query;

  const summary = await attendanceService.getWeeklyAttendance();

  res.json({ message: "Fetched successfully", data: summary });
});

const getMonthlyAttendance = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, employeeId } = req.query;

  const summary = await attendanceService.getMonthlyAttendance();

  res.json({ message: "Fetched successfully", data: summary });
});
const getYearlyAttendance = catchAsync(async (req: Request, res: Response) => {
  const { startDate, endDate, employeeId } = req.query;

  const summary = await attendanceService.getYearlyAttendance ();

  res.json({ message: "Fetched successfully", data: summary });
});


const updateAttendanceTimestamp = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params; // attendance record ID
  const { checkTime } = req.body;

  if (!checkTime) {
    return res.status(400).json({ message: "checkTime is required" });
  }

  const updatedAttendance = await attendanceService.updateAttendanceTimestamp(id, checkTime);

  res.status(200).json({
    message: "Attendance timestamp updated",
    data: updatedAttendance,
  });
});

export default {
  createAttendance,
  getAllAttendanceLogs,
  getAttendanceById,
  bulkDeviceRegistration,
  getAttendanceByDateRange,
  getAttendanceByDate,
  getAttendanceSummary,
  getTodaysAttendace,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getYearlyAttendance,
  updateAttendanceTimestamp
};
