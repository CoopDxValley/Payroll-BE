import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import enhancedAttendanceService from "./enhancedAttendanceService";
import { AuthEmployee } from "../auth/auth.type";
import { PayrollDefinitionStatus } from "@prisma/client";
import prisma from "../../client";

// Get attendance by date range
const getAttendanceByDateRange = catchAsync(
  async (req: Request, res: Response) => {
    console.log("=== Enhanced Attendance Controller: Date Range ===");

    const { startDate, endDate, deviceUserId, shiftId, companyId } = req.query;

    if (!startDate || !endDate) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "startDate and endDate are required",
      });
    }

    const result = await enhancedAttendanceService.getAttendanceByDateRange({
      startDate: startDate as string,
      endDate: endDate as string,
      deviceUserId: deviceUserId as string,
      shiftId: shiftId as string,
      companyId: companyId as string,
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Attendance by date range retrieved successfully",
      data: result,
      meta: {
        startDate,
        endDate,
        totalRecords: result.length,
        filters: {
          deviceUserId: deviceUserId || "all",
          shiftId: shiftId || "all",
          companyId: companyId || "all",
        },
      },
    });
  }
);

// Get today's attendance
// const getTodaysAttendance = catchAsync(async (req: Request, res: Response) => {
//   console.log("=== Enhanced Attendance Controller: Today ===");

//   //   const { deviceUserId, shiftId, companyId } = req.query;

//   const result = await enhancedAttendanceService.getTodaysAttendance({});

//   res.status(httpStatus.OK).json({
//     success: true,
//     message: "Today's attendance retrieved successfully",
//     data: result,
//     meta: {
//       date: new Date().toISOString().split("T")[0],
//       totalRecords: result.length,
//       //   filters: {
//       //     deviceUserId: deviceUserId || "all",
//       //     shiftId: shiftId || "all",
//       //     companyId: companyId || "all",
//       //   },
//     },
//   });
// });
// const getTodaysAttendance  = catchAsync(async (req: Request, res: Response) => {
//   const { startDate, endDate, employeeId } = req.query;
//     const authEmployee = req.employee as AuthEmployee;
// const  companyId= authEmployee.companyId;
//   const result = await enhancedAttendanceService.getTodaysAttendance(companyId);
//   res.json({ message: "Fetched successfully", data: result });
// });

const getTodaysAttendance = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: Today ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId } = req.query;

  // Local midnight, not UTC
  const today = new Date();
  const dateOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const result = await enhancedAttendanceService.getTodaysAttendance({
    companyId,
    date: dateOnly,
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
  });
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  res.status(httpStatus.OK).json({
    success: true,
    message: "Today's attendance retrieved successfully",
    data: result,
    meta: {
      date: formatLocalDate(dateOnly),
      totalRecords: result.length,
      //   filters: {
      //     deviceUserId: deviceUserId || "all",
      //     shiftId: shiftId || "all",
      //     companyId: companyId,
      //   },
    },
  });
});

// Get weekly attendance
const getWeeklyAttendance = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: Weekly ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId } = req.query;

  const result = await enhancedAttendanceService.getWeeklyAttendance({
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
    companyId: companyId,
  });

  // Calculate week range
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - daysToMonday);

  const daysToSunday = 7 - dayOfWeek;
  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + daysToSunday);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Weekly attendance retrieved successfully",
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
        companyId: companyId || "all",
      },
    },
  });
});

// Get monthly attendance
const getMonthlyAttendance = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: Monthly ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId, departmentId } = req.query;

  const result = await enhancedAttendanceService.getMonthlyAttendance({
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
    companyId: companyId,
    departmentId: departmentId as string,
  });

  // get payroll-defined month range
  const getCurrentMonth = async (companyId: string) => {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
    );
    const endOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
    );

    const def = await prisma.payrollDefinition.findFirst({
      where: {
        companyId,
        startDate: { gte: startOfMonth },
        endDate: { lte: endOfMonth },
      },
      orderBy: { startDate: "desc" },
    });

    return def;
  };

  const def = await getCurrentMonth(companyId);

  console.log(def);

  // fall back to calendar month if payrollDefinition not found
  const today = new Date();
  const startDate =
    def?.startDate ?? new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate =
    def?.endDate ?? new Date(today.getFullYear(), today.getMonth() + 1, 0);

  console.log(startDate);
  console.log(endDate);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Monthly attendance retrieved successfully",
    data: result,
    meta: {
      monthRange: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      month: today.toLocaleString("default", { month: "long" }),
      year: today.getFullYear(),
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        companyId: companyId || "all",
      },
    },
  });
});

// Get yearly attendance
const getYearlyAttendance = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: Yearly ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId } = req.query;

  const result = await enhancedAttendanceService.getYearlyAttendance({
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
    companyId: companyId,
  });

  // Calculate year range
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);

  res.status(httpStatus.OK).json({
    success: true,
    message: "Yearly attendance retrieved successfully",
    data: result,
    meta: {
      yearRange: {
        startDate: startOfYear.toISOString().split("T")[0],
        endDate: endOfYear.toISOString().split("T")[0],
      },
      year: today.getFullYear(),
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        companyId: companyId || "all",
      },
    },
  });
});

// Get attendance by specific date
const getAttendanceByDate = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: By Date ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { date, deviceUserId, shiftId } = req.query;

  if (!date) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "date parameter is required",
    });
  }

  const result = await enhancedAttendanceService.getAttendanceByDate({
    date: date as string,
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
    companyId: companyId,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: "Attendance by date retrieved successfully",
    data: result,
    meta: {
      date: date as string,
      totalRecords: result.length,
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        companyId: companyId,
      },
    },
  });
});

// Get attendance summary
const getAttendanceSummary = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: Summary ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { startDate, endDate, deviceUserId, shiftId } = req.query;

  if (!startDate || !endDate) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: "startDate and endDate are required for summary",
    });
  }

  const result = await enhancedAttendanceService.getAttendanceSummary({
    startDate: startDate as string,
    endDate: endDate as string,
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
    companyId: companyId,
  });

  res.status(httpStatus.OK).json({
    success: true,
    message: "Attendance summary retrieved successfully",
    data: result,
    meta: {
      dateRange: {
        startDate,
        endDate,
      },
      filters: {
        deviceUserId: deviceUserId || "all",
        shiftId: shiftId || "all",
        companyId: companyId || "all",
      },
    },
  });
});

// Get payroll definition summary
const getPayrollDefinitionSummary = catchAsync(
  async (req: Request, res: Response) => {
    console.log(
      "=== Enhanced Attendance Controller: Payroll Definition Summary ==="
    );

    const authEmployee = req.employee as AuthEmployee;
    const companyId = authEmployee.companyId;
    // const { payrollDefinitionId } = req.query;

    const result = await enhancedAttendanceService.getPayrollDefinitionSummary({
      companyId,
      // payrollDefinitionId: payrollDefinitionId as string,
    });

    res.status(httpStatus.OK).json({
      success: true,
      message: "Payroll definition summary retrieved successfully",
      data: result,
      meta: {
        totalEmployees: result.employees.length,
        companyId,
        // payrollDefinitionId: payrollDefinitionId || "current",
      },
    });
  }
);

// Get attendance by payroll definition
const getAttendanceByPayrollDefinition = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: By Payroll Definition ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { payrollDefinitionId } = req.params;
  const { deviceUserId, shiftId, departmentId } = req.query;

  const result = await enhancedAttendanceService.getAttendanceByPayrollDefinition({
    payrollDefinitionId: payrollDefinitionId as string,
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
    departmentId: departmentId as string,
    companyId: companyId,
  });

  res.status(200).json({
    success: true,
    message: "Attendance retrieved successfully by payroll definition",
    data: result,
    meta: {
      payrollDefinitionId,
      deviceUserId,
      shiftId,
      departmentId,
      companyId,
    },
  });
});

// Get recent attendance (last 5 days from current month payroll)
const getRecentAttendance = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: Recent Attendance ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { deviceUserId, shiftId, departmentId } = req.query;

  const result = await enhancedAttendanceService.getRecentAttendance({
    deviceUserId: deviceUserId as string,
    shiftId: shiftId as string,
    departmentId: departmentId as string,
    companyId: companyId,
  });

  res.status(200).json({
    success: true,
    message: "Recent attendance retrieved successfully",
    data: result,
    meta: {
      deviceUserId,
      shiftId,
      departmentId,
      companyId,
    },
  });
});

// Get employee attendance by current month payroll definition
const getEmployeeAttendanceByDateRange = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Enhanced Attendance Controller: Employee Attendance by Current Month ===");

  const authEmployee = req.employee as AuthEmployee;
  const companyId = authEmployee.companyId;
  const { employeeId } = req.params;

  const result = await enhancedAttendanceService.getEmployeeAttendanceByDateRange({
    employeeId: employeeId as string,
    companyId: companyId,
  });

  res.status(200).json({
    success: true,
    message: "Employee attendance retrieved successfully for current month",
    data: result,
    meta: {
      employeeId,
      companyId,
    },
  });
});

// Enhanced attendance controller object
const enhancedAttendanceController = {
  getAttendanceByDateRange,
  getTodaysAttendance,
  getWeeklyAttendance,
  getMonthlyAttendance,
  getYearlyAttendance,
  getAttendanceByDate,
  getAttendanceSummary,
  getPayrollDefinitionSummary,
  getAttendanceByPayrollDefinition,
  getRecentAttendance,
  getEmployeeAttendanceByDateRange,
};

export default enhancedAttendanceController;
