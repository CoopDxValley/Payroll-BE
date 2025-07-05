import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import service from "./additionalPayDefinition.service";
import httpStatus from "http-status";
import { AuthEmployee } from "../auth/auth.type";

export const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const companyId = user.companyId;
  const data = await service.create({ ...req.body, companyId });

  res.status(httpStatus.CREATED).json({ message: "Created", data: data });
});

export const getAll = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const companyId = user.companyId;
  const data = await service.getAll(companyId);
  res.json({ success: true, data });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const companyId = user.companyId;
  const data = await service.getById(req.params.id, companyId);
  res.status(httpStatus.OK).send({ data: [data] });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const companyId = user.companyId;
  const data = await service.update(req.params.id, req.body, companyId);
  res.status(httpStatus.OK).send({ message: "Updated", data: data });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthEmployee;
  const companyId = user.companyId;
  const deleted = await service.remove(req.params.id, companyId);

  res.status(httpStatus.OK).send({ message: "Deactivated", data: deleted });
  // res.status(204).send();
});
export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
