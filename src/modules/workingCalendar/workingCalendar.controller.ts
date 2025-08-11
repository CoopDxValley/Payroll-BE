import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import workingCalendarService from "./workingCalendar.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";

// Create a single working calendar entry
const createWorkingCalendar = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.employee as AuthEmployee;

    if (!user.companyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
    }

    const workingCalendar = await workingCalendarService.createWorkingCalendar({
      ...req.body,
      companyId: user.companyId,
    });

    res.status(httpStatus.CREATED).send({
      message: "Working calendar entry created successfully",
      data: workingCalendar,
    });
  }
);

// Get all working calendar entries (with filters)
const getAllWorkingCalendar = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.employee as AuthEmployee;
    const { year, dayType, date, isActive } = req.query;

    if (!user.companyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
    }

    const workingCalendar = await workingCalendarService.getAllWorkingCalendar(
      user.companyId,
      {
        year: year ? parseInt(year as string) : undefined,
        dayType: dayType as string,
        date: date as string,
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
      }
    );

    res.send({
      data: workingCalendar,
      count: workingCalendar.length,
    });
  }
);

// Get working calendar entry by ID
const getWorkingCalendarById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const workingCalendar = await workingCalendarService.getWorkingCalendarById(
      id
    );

    if (!workingCalendar) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Working calendar entry not found"
      );
    }

    res.send({ data: [workingCalendar] });
  }
);

// Update working calendar entry
const updateWorkingCalendar = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const workingCalendar = await workingCalendarService.updateWorkingCalendar(
      id,
      req.body
    );

    res.send({
      message: "Working calendar entry updated successfully",
      data: workingCalendar,
    });
  }
);

// Delete working calendar entry
const deleteWorkingCalendar = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await workingCalendarService.deleteWorkingCalendar(id);

    res.send({
      message: "Working calendar entry deleted successfully",
      data: result,
    });
  }
);

// Bulk upload working calendar entries
const bulkUploadWorkingCalendar = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.employee as AuthEmployee;

    if (!user.companyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
    }

    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Entries array is required and cannot be empty"
      );
    }

    const result = await workingCalendarService.bulkUploadWorkingCalendar(
      entries,
      user.companyId
    );

    res.status(httpStatus.CREATED).send({
      message: `Successfully processed ${result.successCount} entries. ${result.errorCount} errors.`,
      data: {
        successCount: result.successCount,
        errorCount: result.errorCount,
        errors: result.errors,
        createdEntries: result.createdEntries,
      },
    });
  }
);

// Get working calendar by year
const getWorkingCalendarByYear = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.employee as AuthEmployee;
    const { year } = req.params;

    if (!user.companyId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Company context missing.");
    }

    const workingCalendar =
      await workingCalendarService.getWorkingCalendarByYear(
        parseInt(year),
        user.companyId
      );

    res.send({
      data: workingCalendar,
      count: workingCalendar.length,
    });
  }
);

// Get working calendar by date range
const getWorkingCalendarByDateRange = catchAsync(
  async (req: Request, res: Response) => {
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

    const workingCalendar =
      await workingCalendarService.getWorkingCalendarByDateRange(
        new Date(startDate as string),
        new Date(endDate as string),
        user.companyId
      );

    res.send({
      data: workingCalendar,
      count: workingCalendar.length,
    });
  }
);

// Toggle working calendar entry active status
const toggleWorkingCalendarStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const workingCalendar =
      await workingCalendarService.toggleWorkingCalendarStatus(id);

    res.send({
      message: `Working calendar entry ${
        workingCalendar.isActive ? "activated" : "deactivated"
      } successfully`,
      data: workingCalendar,
    });
  }
);

export default {
  createWorkingCalendar,
  getAllWorkingCalendar,
  getWorkingCalendarById,
  updateWorkingCalendar,
  deleteWorkingCalendar,
  bulkUploadWorkingCalendar,
  getWorkingCalendarByYear,
  getWorkingCalendarByDateRange,
  toggleWorkingCalendarStatus,
};
