import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import overtimeGracePeriodService from "./overtimeGracePeriod.service";
import { AuthEmployee } from "../auth/auth.type";

const createOvertimeGracePeriod = catchAsync(
  async (req: Request, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;
    const overtimeGracePeriod =
      await overtimeGracePeriodService.createOvertimeGracePeriod({
        ...req.body,
        companyId: authEmployee.companyId,
      });

    res.status(httpStatus.CREATED).json({
      message: "Overtime grace period created successfully",
      data: overtimeGracePeriod,
    });
  }
);

const getAllActiveOvertimeGracePeriods = catchAsync(
  async (req: Request, res: Response) => {
    const overtimeGracePeriods =
      await overtimeGracePeriodService.getAllActiveOvertimeGracePeriods();

    res.json({
      data: overtimeGracePeriods,
      count: overtimeGracePeriods.length,
    });
  }
);

const getAllOvertimeGracePeriods = catchAsync(
  async (req: Request, res: Response) => {
    const overtimeGracePeriods =
      await overtimeGracePeriodService.getAllOvertimeGracePeriods();

    res.json({
      data: overtimeGracePeriods,
      count: overtimeGracePeriods.length,
    });
  }
);

const getOvertimeGracePeriodById = catchAsync(
  async (req: Request, res: Response) => {
    const overtimeGracePeriod =
      await overtimeGracePeriodService.getOvertimeGracePeriodById(
        req.params.id
      );

    if (!overtimeGracePeriod) {
      res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "Overtime grace period not found" });
      return;
    }

    res.json({ data: [overtimeGracePeriod] });
  }
);

const updateOvertimeGracePeriod = catchAsync(
  async (req: Request, res: Response) => {
    const authEmployee = req.employee as AuthEmployee;

    const overtimeGracePeriod =
      await overtimeGracePeriodService.updateOvertimeGracePeriod(
        req.params.id,
        {
          ...req.body,
          companyId: authEmployee.companyId,
        }
      );

    res.json({
      message: "Overtime grace period updated successfully",
      data: overtimeGracePeriod,
    });
  }
);

const deleteOvertimeGracePeriod = catchAsync(
  async (req: Request, res: Response) => {
    await overtimeGracePeriodService.deleteOvertimeGracePeriod(req.params.id);

    res.status(httpStatus.NO_CONTENT).send();
  }
);

export default {
  createOvertimeGracePeriod,
  getAllOvertimeGracePeriods,
  getOvertimeGracePeriodById,
  updateOvertimeGracePeriod,
  deleteOvertimeGracePeriod,
  getAllActiveOvertimeGracePeriods,
};