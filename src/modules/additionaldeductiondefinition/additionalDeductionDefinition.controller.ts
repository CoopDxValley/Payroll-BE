import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import additionalDeductionDefinitionService from "./additionalDeductionDefinition.service";
import { AuthUser } from "../../types/express";
import ApiError from "../../utils/api-error";

const create = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  if (!user.companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company ID is required.");
  }

  const definition = await additionalDeductionDefinitionService.create({
    ...req.body,
    companyId: user.companyId,
  });

  res.status(httpStatus.CREATED).json({ message: "Created", data: definition });
});

const getAll = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const data = await additionalDeductionDefinitionService.getAll(
    user.companyId
  );
  res
    .status(httpStatus.OK)
    .send({ message: "Fetched successfully", data, count: data.length });
});

const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const def = await additionalDeductionDefinitionService.getById(id);
  if (!def) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  res
    .status(httpStatus.OK)
    .send({ message: "Fetched successfully", data: [def] });
});

const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updated = await additionalDeductionDefinitionService.update(
    id,
    req.body
  );
  res.status(httpStatus.OK).send({ message: "Updated", data: updated });
});

const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const deleted = await additionalDeductionDefinitionService.remove(id);
  res.status(httpStatus.OK).send({ message: "Deactivated", data: deleted });
});

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
