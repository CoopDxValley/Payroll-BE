import prisma from "../../client";
import {
  CreateDeductionDefinitionInput,
  UpdateDeductionDefinitionInput,
} from "./deductiondefinition.type";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";

const create = async (
  data: CreateDeductionDefinitionInput & { companyId: string }
) => {
  return prisma.deductionDefinition.create({ data });
};

const getAll = async (companyId: string) => {
  return prisma.deductionDefinition.findMany({ where: { companyId } });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.deductionDefinition.findFirst({
    where: { id, companyId },
  });
  if (!item)
    throw new ApiError(httpStatus.NOT_FOUND, "DeductionDefinition not found");
  return item;
};

const update = async (
  id: string,
  data: UpdateDeductionDefinitionInput & { companyId: string }
) => {
  const existing = await prisma.deductionDefinition.findFirst({
    where: { id, companyId: data.companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "DeductionDefinition not found");
  return prisma.deductionDefinition.update({ where: { id }, data });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.deductionDefinition.findFirst({
    where: { id, companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "DeductionDefinition not found");
  return prisma.deductionDefinition.delete({ where: { id } });
};

export default { create, getAll, getById, update, remove };
