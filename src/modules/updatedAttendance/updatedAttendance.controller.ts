import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import updatedAttendanceService from "./updatedAttendance.service";
import bulkAttendanceService from "./bulkattendanceservice";
import prisma from "../../client";
import {
  createLocalDateForStorage,
  createLocalDateTime,
  createStableDateTime,
} from "./timeUtils";
import ApiError from "../../utils/api-error";

import updateWorkSessio from "./updateAttendaceservice";

// WorkSession Controllers
const createWorkSession = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Direct Work Session Creation ===");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  // Check if this is a HOLIDAY or REST_DAY before creating work session
  const { deviceUserId, date } = req.body;

  if (deviceUserId && date) {
    // Get employee information
    const employee = await prisma.employee.findFirst({
      where: { deviceUserId },
      include: {
        employeeShifts: {
          where: { isActive: true },
          include: { shift: true },
          orderBy: { startDate: "desc" },
          take: 1,
        },
      },
    });

    if (employee && employee.employeeShifts.length > 0) {
      const shiftId = employee.employeeShifts[0].shiftId;
      const requestDate = createLocalDateForStorage(date);

      // Check for holiday first
      const holiday = await prisma.workingCalendar.findFirst({
        where: {
          // companyId: employee.companyId,
          date: requestDate,
          dayType: "HOLIDAY",
          isActive: true,
        },
      });

      if (holiday) {
        console.log("HOLIDAY detected in direct work session creation");
        console.log(
          `Holiday: ${
            holiday.description || "Unnamed Holiday"
          } on ${requestDate.toDateString()}`
        );

        // Convert work session data to smart attendance format and use holiday handler
        const smartAttendanceData = {
          deviceUserId,
          date,
          punchIn: req.body.punchIn,
          punchOut: req.body.punchOut,
          punchInSource: req.body.punchInSource || "manual",
          punchOutSource: req.body.punchOutSource || "manual",
        };

        const result = await updatedAttendanceService.smartAttendance(
          smartAttendanceData
        );
        res.status(httpStatus.CREATED).json({
          success: true,
          message: "Holiday work recorded successfully (overtime only)",
          data: result,
        });
        return;
      }

      // Check for REST_DAY
      const shiftDay = await prisma.shiftDay.findFirst({
        where: {
          shiftId,
          dayNumber: requestDate.getDay() === 0 ? 7 : requestDate.getDay(),
        },
      });

      if (shiftDay && shiftDay.dayType === "REST_DAY") {
        console.log("REST_DAY detected in direct work session creation");
        console.log(`REST_DAY on ${requestDate.toDateString()}`);

        // Convert work session data to smart attendance format and use REST_DAY handler
        const smartAttendanceData = {
          deviceUserId,
          date,
          punchIn: req.body.punchIn,
          punchOut: req.body.punchOut,
          punchInSource: req.body.punchInSource || "manual",
          punchOutSource: req.body.punchOutSource || "manual",
        };

        const result = await updatedAttendanceService.smartAttendance(
          smartAttendanceData
        );
        res.status(httpStatus.CREATED).json({
          success: true,
          message: "REST_DAY work recorded successfully (overtime only)",
          data: result,
        });
        return;
      }
    }
  }

  // Regular work day - convert to smart attendance format for proper overtime processing
  console.log(
    "Regular work day - processing via smart attendance for proper overtime calculation"
  );
  console.log("Request body received:", JSON.stringify(req.body, null, 2));

  // Validate required fields
  if (!req.body.date) {
    throw new ApiError(httpStatus.BAD_REQUEST, "date field is required");
  }

  // Convert time-only strings to proper DateTime format if needed
  let processedBody = { ...req.body };

  // Handle time-only strings for punchIn
  if (
    processedBody.punchIn &&
    typeof processedBody.punchIn === "string" &&
    processedBody.punchIn.match(/^\d{2}:\d{2}:\d{2}$/)
  ) {
    console.log(
      `Converting punchIn time-only string: ${processedBody.punchIn}`
    );
    if (!processedBody.date || typeof processedBody.date !== "string") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Valid date field is required when using time-only punchIn"
      );
    }
    const punchInDateTime = createStableDateTime(
      processedBody.date,
      processedBody.punchIn
    );
    processedBody.punchIn = punchInDateTime.toISOString();
    console.log(`Converted punchIn: ${processedBody.punchIn}`);
  }

  // Handle time-only strings for punchOut
  if (
    processedBody.punchOut &&
    typeof processedBody.punchOut === "string" &&
    processedBody.punchOut.match(/^\d{2}:\d{2}:\d{2}$/)
  ) {
    console.log(
      `Converting punchOut time-only string: ${processedBody.punchOut}`
    );
    if (!processedBody.date || typeof processedBody.date !== "string") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Valid date field is required when using time-only punchOut"
      );
    }
    const punchOutDateTime = createStableDateTime(
      processedBody.date,
      processedBody.punchOut
    );
    processedBody.punchOut = punchOutDateTime.toISOString();
    console.log(`Converted punchOut: ${processedBody.punchOut}`);
  }

  // Ensure sources are set
  processedBody.punchInSource = processedBody.punchInSource || "manual";
  processedBody.punchOutSource = processedBody.punchOutSource || "manual";

  // Use smart attendance for proper overtime calculation with grace period
  console.log(
    "Processed body being sent to smartAttendance:",
    JSON.stringify(processedBody, null, 2)
  );

  try {
    const result = await updatedAttendanceService.smartAttendance(
      processedBody
    );
    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Work session created successfully",
      data: result,
    });
  } catch (error: any) {
    console.log("Error in work-sessions controller:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    throw error;
  }
});

const getWorkSessions = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query as any;
  const result = await updatedAttendanceService.getWorkSessions(filters);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Work sessions retrieved successfully",
    data: result,
  });
});

const getWorkSessionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await updatedAttendanceService.getWorkSessionById(id);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Work session retrieved successfully",
    data: result,
  });
});

const updateWorkSession = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  // const result = await updatedAttendanceService.updateWorkSession(id, req.body);
  const result = await updateWorkSessio.updateWorkSession(id, req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Work session updated successfully",
    data: result,
  });
});

const deleteWorkSession = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await updatedAttendanceService.deleteWorkSession(id);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Work session deleted successfully",
  });
});

// Smart Attendance Controller (Main API)
const smartAttendance = catchAsync(async (req: Request, res: Response) => {
  const result = await updatedAttendanceService.smartAttendance(req.body);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Attendance recorded successfully",
    data: result,
  });
});

// Punch Controllers (Legacy)
const punchIn = catchAsync(async (req: Request, res: Response) => {
  const { deviceUserId, date, punchIn, punchInSource } = req.body;
  const result = await updatedAttendanceService.punchIn(
    deviceUserId,
    date,
    punchIn, // Optional: if not provided, uses current time
    punchInSource || "manual"
  );
  res.status(httpStatus.OK).json({
    success: true,
    message: "Punch in recorded successfully",
    data: result,
  });
});

const punchOut = catchAsync(async (req: Request, res: Response) => {
  const { deviceUserId, date, punchOut, punchOutSource } = req.body;
  const result = await updatedAttendanceService.punchOut(
    deviceUserId,
    date,
    punchOut, // Optional: if not provided, uses current time
    punchOutSource || "manual"
  );
  res.status(httpStatus.OK).json({
    success: true,
    message: "Punch out recorded successfully",
    data: result,
  });
});

// OvertimeTable Controllers
const createOvertimeTable = catchAsync(async (req: Request, res: Response) => {
  const result = await updatedAttendanceService.createOvertimeTable(req.body);
  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Overtime record created successfully",
    data: result,
  });
});

const getOvertimeTables = catchAsync(async (req: Request, res: Response) => {
  const filters = req.query as any;
  const result = await updatedAttendanceService.getOvertimeTables(filters);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime records retrieved successfully",
    data: result,
  });
});

const getOvertimeTableById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await updatedAttendanceService.getOvertimeTableById(id);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime record retrieved successfully",
    data: result,
  });
});

const updateOvertimeTable = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await updatedAttendanceService.updateOvertimeTable(
    id,
    req.body
  );
  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime record updated successfully",
    data: result,
  });
});

const deleteOvertimeTable = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await updatedAttendanceService.deleteOvertimeTable(id);
  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime record deleted successfully",
  });
});

const updateOvertimeStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await updatedAttendanceService.updateOvertimeStatus(
    id,
    status
  );
  res.status(httpStatus.OK).json({
    success: true,
    message: "Overtime status updated successfully",
    data: result,
  });
});

// Bulk Attendance Controller
const bulkAttendance = catchAsync(async (req: Request, res: Response) => {
  console.log("=== Bulk Attendance API Called ===");

  // Validate that attendanceRecords array exists
  if (
    !req.body.attendanceRecords ||
    !Array.isArray(req.body.attendanceRecords)
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "attendanceRecords array is required"
    );
  }

  if (req.body.attendanceRecords.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "attendanceRecords array cannot be empty"
    );
  }

  // Use the transaction-based method for better performance
  const result =
    await bulkAttendanceService.processBulkAttendanceWithTransaction(req.body);

  res.status(httpStatus.OK).json({
    success: true,
    message: `Bulk attendance processed: ${result.successfulRecords} successful, ${result.failedRecords} failed`,
    data: result,
  });
});

export default {
  // Smart Attendance (Main API)
  smartAttendance,

  // Bulk Attendance API
  bulkAttendance,

  // WorkSession
  createWorkSession,
  getWorkSessions,
  getWorkSessionById,
  updateWorkSession,
  deleteWorkSession,

  // Punch (Legacy)
  punchIn,
  punchOut,

  // OvertimeTable
  createOvertimeTable,
  getOvertimeTables,
  getOvertimeTableById,
  updateOvertimeTable,
  deleteOvertimeTable,
  updateOvertimeStatus,
};
