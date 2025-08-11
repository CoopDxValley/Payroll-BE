import { Request, Response } from "express";
import catchAsync from "../../utils/catch-async";
import httpStatus from "http-status";
import { AuthEmployee } from "../auth/auth.type";
import additionalPayDefinitionService from "./additionalPayDefinition.service";
import { CustomRequest } from "../../middlewares/validate";
import {
  createAdditionalDeductionDefination,
  getAdditionalDeductionDefinationParams,
  updateAdditionalDeductionDefinationBody,
  updateAdditionalDeductionDefinationParams,
} from "../additionaldeductiondefinition/additional-deduction-defination.type";

export const create = catchAsync<
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

    const data = await additionalPayDefinitionService.create(inputData);

    res.status(httpStatus.CREATED).json({ message: "Created", data: data });
  }
);

const getAll = catchAsync(async (req: Request, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;
  const data = await additionalPayDefinitionService.getAll(
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
    const authEmployee = req.employee as AuthEmployee;
    const companyId = authEmployee.companyId;
    const data = await additionalPayDefinitionService.getById(
      req.params.id,
      companyId
    );
    res.status(httpStatus.OK).send({
      data,
      message: "additional pay defination retrieved successfully",
    });
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
    const authEmployee = req.employee as AuthEmployee;
    const { id } = req.params;
    const updateData = { ...req.body, companyId: authEmployee.companyId };

    const data = await additionalPayDefinitionService.update(id, updateData);

    res.status(httpStatus.OK).send({ message: "Updated", data: data });
  }
);

const remove = catchAsync<
  CustomRequest<getAdditionalDeductionDefinationParams, never, never>
>(
  async (
    req: CustomRequest<getAdditionalDeductionDefinationParams, never, never>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const { id } = req.params;
    const companyId = authEmployee.companyId;
    const deleted = await additionalPayDefinitionService.remove(
      req.params.id,
      companyId
    );

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
