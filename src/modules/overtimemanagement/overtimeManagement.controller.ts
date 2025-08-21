import { Request, Response } from "express";
// import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status";
import overtimeManagementService from "./overtimeManagement.service";
// import { AuthEmployee } from "../../types/auth";

import catchAsync from "../../utils/catch-async";
import { AuthEmployee } from "../auth/auth.type";

// Enhanced Overtime Controllers

// Get overtime by date range
const getOvertimeByDateRange = catchAsync(
  async (req: Request, res: Response) => {
    console.log("=== Overtime Management Controller: Date Range ===");

    const authEmployee = req.employee as AuthEmployee;
    const companyId = authEmployee.companyId;
    const {
      startDate,
      endDate,
      deviceUserId,
      shiftId,
      overtimeType,
      overtimeStatus,
    } = req.query;

    if (!startDate || !endDate) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const result = await overtimeManagementService.getOvertimeByDateRange(
      {
        startDate: startDate as string,
        endDate: endDate as string,
        deviceUserId: deviceUserId as string,
        shiftId: shiftId as string,
        overtimeType: overtimeType as any,
        overtimeStatus: overtimeStatus as any,
      },
      companyId
    );

    res.status(httpStatus.OK).json({
      success: true,
      message: "Overtime by date range retrieved successfully",
      data: result,
      meta: {
        dateRange: {
          startDate,
          endDate,
        },
        totalRecords: result.length,
        filters: {
          deviceUserId: deviceUserId || "all",
          shiftId: shiftId || "all",
          overtimeType: overtimeType || "all",
          overtimeStatus: overtimeStatus || "all",
          companyId: companyId,
        },
      },
    });
  }
);

// Get today's overtime
const getTodaysOvertime = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Today ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId, overtimeType, overtimeStatus } = req.query;

  const result = await overtimeManagementService.getTodaysOvertime(
    {
      deviceUserId: deviceUserId as string,
      shiftId: shiftId as string,
      overtimeType: overtimeType as any,
      overtimeStatus: overtimeStatus as any,
    },
    companyId
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Today's overtime retrieved successfully",
    data: result,
    meta: {
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        overtimeType: overtimeType || "all",
        overtimeStatus: overtimeStatus || "all",
        companyId: companyId,
      },
    },
  });
});

// Get weekly overtime
const getWeeklyOvertime = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Weekly ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId, overtimeType, overtimeStatus } = req.query;

  const result = await overtimeManagementService.getWeeklyOvertime(
    {
      deviceUserId: deviceUserId as string,
      shiftId: shiftId as string,
      overtimeType: overtimeType as any,
      overtimeStatus: overtimeStatus as any,
    },
    companyId
  );

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Weekly overtime retrieved successfully",
    data: result,
    meta: {
      weekRange: {
        startDate: startOfWeek.toISOString().split("T")[0],
        endDate: endOfWeek.toISOString().split("T")[0],
      },
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        overtimeType: overtimeType || "all",
        overtimeStatus: overtimeStatus || "all",
        companyId: companyId,
      },
    },
  });
});

// Get monthly overtime
const getMonthlyOvertime = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Monthly ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId, overtimeType, overtimeStatus } = req.query;

  const result = await overtimeManagementService.getMonthlyOvertime(
    {
      deviceUserId: deviceUserId as string,
      shiftId: shiftId as string,
      overtimeType: overtimeType as any,
      overtimeStatus: overtimeStatus as any,
    },
    companyId
  );

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Monthly overtime retrieved successfully",
    data: result,
    meta: {
      monthRange: {
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: endOfMonth.toISOString().split("T")[0],
      },
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        overtimeType: overtimeType || "all",
        overtimeStatus: overtimeStatus || "all",
        companyId: companyId,
      },
    },
  });
});

// Get yearly overtime
const getYearlyOvertime = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Yearly ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId, overtimeType, overtimeStatus } = req.query;

  const result = await overtimeManagementService.getYearlyOvertime(
    {
      deviceUserId: deviceUserId as string,
      shiftId: shiftId as string,
      overtimeType: overtimeType as any,
      overtimeStatus: overtimeStatus as any,
    },
    companyId
  );

  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Yearly overtime retrieved successfully",
    data: result,
    meta: {
      yearRange: {
        startDate: startOfYear.toISOString().split("T")[0],
        endDate: endOfYear.toISOString().split("T")[0],
      },
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        overtimeType: overtimeType || "all",
        overtimeStatus: overtimeStatus || "all",
        companyId: companyId,
      },
    },
  });
});

// Get overtime by specific date
const getOvertimeByDate = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: By Date ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { date, deviceUserId, shiftId, overtimeType, overtimeStatus } =
    req.query;

  if (!date) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "date parameter is required",
    });
  }

  const result = await overtimeManagementService.getOvertimeByDate(
    {
      date: date as string,
      deviceUserId: deviceUserId as string,
      shiftId: shiftId as string,
      overtimeType: overtimeType as any,
      overtimeStatus: overtimeStatus as any,
    },
    companyId
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime by date retrieved successfully",
    data: result,
    meta: {
      date: date as string,
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        overtimeType: overtimeType || "all",
        overtimeStatus: overtimeStatus || "all",
        companyId: companyId,
      },
    },
  });
});

// Get overtime summary
const getOvertimeSummary = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Summary ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const {
    startDate,
    endDate,
    deviceUserId,
    shiftId,
    overtimeType,
    overtimeStatus,
  } = req.query;

  if (!startDate || !endDate) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "startDate and endDate are required for summary",
    });
  }

  const result = await overtimeManagementService.getOvertimeSummary(
    {
      startDate: startDate as string,
      endDate: endDate as string,
      deviceUserId: deviceUserId as string,
      shiftId: shiftId as string,
      overtimeType: overtimeType as any,
      overtimeStatus: overtimeStatus as any,
    },
    companyId
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime summary retrieved successfully",
    data: result.sessions,
    summary: result.summary,
    meta: {
      dateRange: {
        startDate,
        endDate,
      },
      totalRecords: result.sessions.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        overtimeType: overtimeType || "all",
        overtimeStatus: overtimeStatus || "all",
        companyId: companyId,
      },
    },
  });
});

// OvertimeTable CRUD Controllers

// Create overtime table
const createOvertimeTable = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Create Overtime ===");

  const result = await overtimeManagementService.createOvertimeTable(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Overtime record created successfully",
    data: result,
  });
});

// Get overtime tables
const getOvertimeTables = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Get Overtimes ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, startDate, endDate, type, status, workSessionId } =
    req.query;

  const filters = {
    deviceUserId: deviceUserId as string,
    startDate: startDate as string,
    endDate: endDate as string,
    type: type as any,
    status: status as any,
    workSessionId: workSessionId as string,
    companyId,
  };

  const result = await overtimeManagementService.getOvertimeTables(filters);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime records retrieved successfully",
    data: result,
    meta: {
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        startDate: startDate || "all",
        endDate: endDate || "all",
        type: type || "all",
        status: status || "all",
        workSessionId: workSessionId || "all",
        companyId: companyId,
      },
    },
  });
});

// Get overtime table by ID
const getOvertimeTableById = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Get Overtime by ID ===");

  const { id } = req.params;
  const result = await overtimeManagementService.getOvertimeTableById(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime record retrieved successfully",
    data: result,
  });
});

// Update overtime table
const updateOvertimeTable = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Update Overtime ===");

  const { id } = req.params;
  const result = await overtimeManagementService.updateOvertimeTable(
    id,
    req.body
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime record updated successfully",
    data: result,
  });
});

// Delete overtime table
const deleteOvertimeTable = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Delete Overtime ===");

  const { id } = req.params;
  await overtimeManagementService.deleteOvertimeTable(id);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime record deleted successfully",
  });
});

// Update overtime status
const updateOvertimeStatus = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Overtime Management Controller: Update Overtime Status ===");

  const { id } = req.params;
  const result = await overtimeManagementService.updateOvertimeStatus(
    id,
    req.body
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime status updated successfully",
    data: result,
  });
});

// Overtime management controller object
const overtimeManagementController = {
  // Enhanced Overtime Endpoints
  getOvertimeByDateRange,
  getTodaysOvertime,
  getWeeklyOvertime,
  getMonthlyOvertime,
  getYearlyOvertime,
  getOvertimeByDate,
  getOvertimeSummary,

  // OvertimeTable CRUD
  createOvertimeTable,
  getOvertimeTables,
  getOvertimeTableById,
  updateOvertimeTable,
  deleteOvertimeTable,
  updateOvertimeStatus,
};

export default overtimeManagementController;
