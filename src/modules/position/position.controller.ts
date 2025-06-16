import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import positionService from "./position.service";
import { AuthUser } from "../../types/express";
import ApiError from "../../utils/api-error";

const createPosition = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;

  if (!user.companyId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User must be associated with a company to create departments"
    );
  }

  const position = await positionService.createPosition({
    ...req.body,
    companyId: user.companyId,
  });
  res
    .status(httpStatus.CREATED)
    .send({ message: "Position created", data: position });
});

const getAllPositions = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const positions = await positionService.getAllPositions(user.companyId);
  res.send({ data: positions });
});

const getPositionById = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const position = await positionService.getPositionById(id);

  if (!position) {
    res.status(httpStatus.NOT_FOUND).send({ message: "Position not found" });
    return;
  }

  res.send({ data: position });
});

const updatePosition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const position = await positionService.updatePosition(id, req.body);
  res.send({ message: "Position updated", data: position });
});

const deletePosition = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
    const user = req.user as AuthUser;
   const companyId= user.companyId
  const updated = await positionService.deletePosition(id,companyId);
  res
    .status(httpStatus.OK)
    .send({ message: "Position deactivated", data: updated });
});

export default {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
};
