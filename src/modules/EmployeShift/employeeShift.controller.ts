import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import employeeShiftService from "./employeeShift.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";

const assignShiftToEmployee = catchAsync(async (req: Request, res: Response) => {
 const user = req.employee as AuthEmployee;
  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const employeeShift = await employeeShiftService.assignShiftToEmployee({
    ...req.body,
    companyId: user.companyId,
  });

  res.status(httpStatus.CREATED).send({ 
    message: "Shift assigned to employee successfully", 
    data: employeeShift 
  });
});

const unassignShiftFromEmployee = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;

  const { employeeId, shiftId } = req.query;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  if (!employeeId || !shiftId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "employeeId and shiftId are required.");
  }

  const result = await employeeShiftService.unassignShiftFromEmployee(
    employeeId as string,
    shiftId as string,
    user.companyId
  );

  res.send({ 
    message: "Shift unassigned from employee successfully", 
    data: result 
  });
});

const getEmployeeShifts = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { employeeId } = req.query;

  const employeeShifts = await employeeShiftService.getEmployeeShifts(
    user.companyId,
    employeeId as string
  );

  res.send({ 
    data: employeeShifts, 
    count: employeeShifts.length 
  });
});

const getEmployeeShiftById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const employeeShift = await employeeShiftService.getEmployeeShiftById(id);

  if (!employeeShift) {
    throw new ApiError(httpStatus.NOT_FOUND, "Employee shift assignment not found");
  }

  res.send({ data: employeeShift });
});

const getActiveEmployeeShift = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const employeeShift = await employeeShiftService.getActiveEmployeeShift(employeeId);

  if (!employeeShift) {
    throw new ApiError(httpStatus.NOT_FOUND, "No active shift assignment found for this employee");
  }

  res.send({ data: employeeShift });
});

const getEmployeeShiftHistory = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const employeeShifts = await employeeShiftService.getEmployeeShiftHistory(employeeId);

  res.send({ 
    data: employeeShifts, 
    count: employeeShifts.length 
  });
});

// New controller method to get shift details
const getShiftDetails = catchAsync(async (req: Request, res: Response) => {
  const user = req.employee as AuthEmployee;
  const { shiftId } = req.params;

  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
  }

  const shiftDetails = await employeeShiftService.getShiftDetails(shiftId, user.companyId);
  res.send({ data: shiftDetails });
});

// New controller method to calculate working hours
const calculateWorkingHours = catchAsync(async (req: Request, res: Response) => {
  const { employeeId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ApiError(httpStatus.BAD_REQUEST, "startDate and endDate are required.");
  }

  const workingHours = await employeeShiftService.calculateWorkingHours(
    employeeId,
    new Date(startDate as string),
    new Date(endDate as string)
  );

  res.send({ data: workingHours });
});

export default {
  assignShiftToEmployee,
  unassignShiftFromEmployee,
  getEmployeeShifts,
  getEmployeeShiftById,
  getActiveEmployeeShift,
  getEmployeeShiftHistory,
  getShiftDetails,
  calculateWorkingHours,
}; 