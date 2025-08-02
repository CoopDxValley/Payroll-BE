import prisma from "../../client";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";
import {
  createAdditionalDeductionDefination,
  updateAdditionalDeductionDefinationBody,
} from "./additional-deduction-defination.type";

const create = async (
  data: createAdditionalDeductionDefination & { companyId: string }
) => {
  const { name, companyId } = data;

  const existing = await prisma.additionalDeductionDefinition.findFirst({
    where: {
      name: name.trim(),
      companyId,
      isActive: true,
    },
  });

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Name already exists.");
  }

  return prisma.additionalDeductionDefinition.create({
    data,
  });
};

const getAll = async (companyId: string) => {
  return prisma.additionalDeductionDefinition.findMany({
    where: { companyId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string) => {
  const result = await prisma.additionalDeductionDefinition.findUnique({
    where: { id },
  });

  if (!result)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "additional deduction is not found"
    );
  return result;
};

const update = async (
  id: string,
  data: updateAdditionalDeductionDefinationBody
) => {
  return prisma.additionalDeductionDefinition.update({
    where: { id },
    data,
  });
};

const remove = async (id: string) => {
  return prisma.additionalDeductionDefinition.update({
    where: { id },
    data: { isActive: false },
  });
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
};
