import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import positionService from "./position.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import {
  CreatePositionInput,
  GetOrDeletePositionParams,
  UpdatePositionInput,
  UpdatePositionParams,
} from "./position.type";

const createPosition = catchAsync<
  CustomRequest<never, never, CreatePositionInput>
>(
  async (
    req: CustomRequest<never, never, CreatePositionInput>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: CreatePositionInput & { companyId: string } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    if (!authEmployee.companyId) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "User must be associated with a company to create departments"
      );
    }

    const position = await positionService.createPosition(inputData);
    res
      .status(httpStatus.CREATED)
      .send({ message: "Position created", data: position });
  }
);

const getAllPositions = catchAsync(async (req: Request, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const positions = await positionService.getAllPositions(
    authEmployee.companyId
  );
  res.send({ data: positions });
});

const getPositionById = catchAsync<
  CustomRequest<GetOrDeletePositionParams, never, never>
>(
  async (
    req: CustomRequest<GetOrDeletePositionParams, never, never>,
    res: Response
  ) => {
    const id = req.params.id;
    const position = await positionService.getPositionById(id);

    if (!position) {
      res.status(httpStatus.NOT_FOUND).send({ message: "Position not found" });
      return;
    }

    res.send({ data: position });
  }
);

const updatePosition = catchAsync<
  CustomRequest<UpdatePositionParams, never, UpdatePositionInput>
>(
  async (
    req: CustomRequest<UpdatePositionParams, never, UpdatePositionInput>,
    res: Response
  ) => {
    const id = req.params.id;
    const inputData: UpdatePositionInput & { companyId: string } = {
      ...req.body,
      companyId: (req.employee as AuthEmployee).companyId,
    };
    const position = await positionService.updatePosition(id, inputData);
    res.send({ message: "Position updated", data: position });
  }
);

const deletePosition = catchAsync<
  CustomRequest<GetOrDeletePositionParams, never, never>
>(
  async (
    req: CustomRequest<GetOrDeletePositionParams, never, never>,
    res: Response
  ) => {
    const id = req.params.id;
    const authEmployee = req.employee as AuthEmployee;
    const updated = await positionService.deletePosition(
      id,
      authEmployee.companyId
    );
    res
      .status(httpStatus.OK)
      .send({ message: "Position deactivated", data: updated });
  }
);

export default {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
};
