import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import additionalDeductionDefinitionService from "./additionalDeductionDefinition.service";
import ApiError from "../../utils/api-error";
import { AuthEmployee } from "../auth/auth.type";
import { CustomRequest } from "../../middlewares/validate";
import {
  createAdditionalDeductionDefination,
  getAdditionalDeductionDefinationParams,
  updateAdditionalDeductionDefinationBody,
  updateAdditionalDeductionDefinationParams,
} from "./additional-deduction-defination.type";

const create = catchAsync<
  CustomRequest<never, never, createAdditionalDeductionDefination>
>(
  async (
    req: CustomRequest<never, never, createAdditionalDeductionDefination>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const inputData: createAdditionalDeductionDefination & {
      companyId: string;
    } = {
      ...req.body,
      companyId: authEmployee.companyId,
    };

    const definition = await additionalDeductionDefinitionService.create(
      inputData
    );

    res
      .status(httpStatus.CREATED)
      .json({ message: "Created Successfully", data: definition });
  }
);

const getAll = catchAsync(async (req: Request, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalDeductionDefinitionService.getAll(
    authEmployee.companyId
  );
  res
    .status(httpStatus.OK)
    .send({ message: "Fetched successfully", data, count: data.length });
});

const getById = catchAsync<
  CustomRequest<getAdditionalDeductionDefinationParams, never, never>
>(
  async (
    req: CustomRequest<getAdditionalDeductionDefinationParams, never, never>,
    res: Response
  ) => {
    const { id } = req.params;
    const def = await additionalDeductionDefinitionService.getById(id);

    res
      .status(httpStatus.OK)
      .send({ message: "Fetched successfully", data: [def] });
  }
);

const update = catchAsync<
  CustomRequest<
    updateAdditionalDeductionDefinationParams,
    never,
    updateAdditionalDeductionDefinationBody
  >
>(
  async (
    req: CustomRequest<
      updateAdditionalDeductionDefinationParams,
      never,
      updateAdditionalDeductionDefinationBody
    >,
    res: Response
  ) => {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await additionalDeductionDefinitionService.update(
      id,
      updateData
    );
    res.status(httpStatus.OK).send({ message: "Updated", data: updated });
  }
);

const remove = catchAsync<
  CustomRequest<getAdditionalDeductionDefinationParams, never, never>
>(
  async (
    req: CustomRequest<getAdditionalDeductionDefinationParams, never, never>,
    res: Response
  ) => {
    const { id } = req.params;
    const deleted = await additionalDeductionDefinitionService.remove(id);
    res.status(httpStatus.OK).send({ message: "Deactivated", data: deleted });
  }
);

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
