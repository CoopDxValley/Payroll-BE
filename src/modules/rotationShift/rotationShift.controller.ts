import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import rotationShiftService from "./rotationShift.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";
import { format } from "date-fns";
// ==================== SHIFT SCHEDULE CONTROLLERS ====================

const createShiftSchedule = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  
  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftSchedule = await rotationShiftService.createShiftSchedule({
    ...req.body,
    companyId: user.companyId,
  });

  res.status(httpStatus.CREATED).send({
    message: "Shift schedule created successfully",
    data: shiftSchedule,
  });
});

const getShiftSchedules = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { isActive, isApproved, startDate, endDate } = req.query;

  const filters: any = {};
  if (isActive !== undefined) filters.isActive = isActive === "true";
  if (isApproved !== undefined) filters.isApproved = isApproved === "true";
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);

  const schedules = await rotationShiftService.getShiftSchedules(
    user.companyId,
    filters
  );

  // Convert dates to "YYYY-MM-DD" strings
  const formattedSchedules = schedules.map((s) => ({
    ...s,
    startDate: format(new Date(s.startDate), "yyyy-MM-dd"),
    endDate: format(new Date(s.endDate), "yyyy-MM-dd"),
  }));

  res.send({
    data: formattedSchedules,
    count: formattedSchedules.length,
  });
});

const getShiftScheduleById = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const schedule = await rotationShiftService.getShiftScheduleById(
    id,
    user.companyId
  );

  res.send({ data: schedule });
});

const updateShiftSchedule = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const schedule = await rotationShiftService.updateShiftSchedule(
    id,
    user.companyId,
    req.body
  );

  res.send({
    message: "Shift schedule updated successfully",
    data: schedule,
  });
});

const approveShiftSchedule = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const schedule = await rotationShiftService.approveShiftSchedule(
    id,
    user.companyId
  );

  res.send({
    message: "Shift schedule approved successfully",
    data: schedule,
  });
});

const deleteShiftSchedule = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const result = await rotationShiftService.deleteShiftSchedule(
    id,
    user.companyId
  );

  res.send({
    message: result.message,
    data: result,
  });
});

// ==================== EMPLOYEE SHIFT ASSIGNMENT CONTROLLERS ====================

const createEmployeeShiftAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  
  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const assignment = await rotationShiftService.createEmployeeShiftAssignment({
    ...req.body,
    companyId: user.companyId,
  });

  res.status(httpStatus.CREATED).send({
    message: "Shift assignment created successfully",
    data: assignment,
  });
});

const getEmployeeShiftAssignments = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const {
    employeeId,
    scheduleId,
    date,
    startDate,
    endDate,
    shiftTypeId,
    isApproved,
  } = req.query;

  const filters: any = {};
  if (employeeId) filters.employeeId = employeeId;
  if (scheduleId) filters.scheduleId = scheduleId;
  if (date) filters.date = new Date(date as string);
  if (startDate) filters.startDate = new Date(startDate as string);
  if (endDate) filters.endDate = new Date(endDate as string);
  if (shiftTypeId) filters.shiftTypeId = shiftTypeId;
  if (isApproved !== undefined) filters.isApproved = isApproved === "true";

  const assignments = await rotationShiftService.getEmployeeShiftAssignments(
    user.companyId,
    filters
  );

  res.send({
    data: assignments,
    count: assignments.length,
  });
});

const updateEmployeeShiftAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const assignment = await rotationShiftService.updateEmployeeShiftAssignment(
    id,
    user.companyId,
    req.body
  );

  res.send({
    message: "Shift assignment updated successfully",
    data: assignment,
  });
});

const approveEmployeeShiftAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const assignment = await rotationShiftService.approveEmployeeShiftAssignment(
    id,
    user.companyId
  );

  res.send({
    message: "Shift assignment approved successfully",
    data: assignment,
  });
});

const deleteEmployeeShiftAssignment = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { id } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const result = await rotationShiftService.deleteEmployeeShiftAssignment(
    id,
    user.companyId
  );

  res.send({
    message: result.message,
    data: result,
  });
});

// ==================== BULK OPERATION CONTROLLERS ====================

const bulkCreateAssignments = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  
  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const result = await rotationShiftService.bulkCreateAssignments({
    ...req.body,
    companyId: user.companyId,
  });

  res.status(httpStatus.CREATED).send({
    message: result.message,
    data: result,
  });
});

const getEmployeeRotationSummary = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  if (!startDate || !endDate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "startDate and endDate are required"
    );
  }

  const summary = await rotationShiftService.getEmployeeRotationSummary(
    employeeId,
    user.companyId,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.send({ data: summary });
});

const getAllEmployeeRotationSummaries = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { startDate, endDate } = req.query;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  if (!startDate || !endDate) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "startDate and endDate are required"
    );
  }

  const summary = await rotationShiftService.getAllEmployeeRotationSummaries(
    user.companyId,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.send({ data: summary });
});
export default {
  // Shift Schedule controllers
  createShiftSchedule,
  getShiftSchedules,
  getShiftScheduleById,
  updateShiftSchedule,
  approveShiftSchedule,
  deleteShiftSchedule,

  // Employee Shift Assignment controllers
  createEmployeeShiftAssignment,
  getEmployeeShiftAssignments,
  updateEmployeeShiftAssignment,
  approveEmployeeShiftAssignment,
  deleteEmployeeShiftAssignment,

  // Bulk operation controllers
  bulkCreateAssignments,
  getEmployeeRotationSummary,
  getAllEmployeeRotationSummaries 
}; 