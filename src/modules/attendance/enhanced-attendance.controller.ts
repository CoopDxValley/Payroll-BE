import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import { createEnhancedAttendance, bulkCreateEnhancedAttendance } from "./enhanced-attendance.service";
import { AuthEmployee } from "../auth/auth.type";

const createEnhancedAttendanceRecord = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;

  const log = await createEnhancedAttendance({
    ...req.body,
    deviceUserId: req.body.deviceUserId || user.id,
  });

  res.status(httpStatus.CREATED).json({
    message: "Enhanced attendance logged with shift-aware overtime calculation",
    data: log,
  });
});

const bulkCreateEnhancedAttendanceRecords = catchAsync(async (req: Request, res: Response) => {
  const { records } = req.body;

  const result = await bulkCreateEnhancedAttendance(records);

  res.status(httpStatus.CREATED).json({
    message: "Bulk enhanced attendance creation completed with shift-aware overtime calculation",
    ...result,
  });
});

export default {
  createEnhancedAttendanceRecord,
  bulkCreateEnhancedAttendanceRecords,
}; 