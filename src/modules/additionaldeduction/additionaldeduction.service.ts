import httpStatus from "http-status";
import prisma from "../../client";
import {
  CreateAdditionalDeductionInput,
  UpdateAdditionalDeductionInput,
} from "./additionaldeduction.type";
import ApiError from "../../utils/api-error";

const create = async (
  data: CreateAdditionalDeductionInput & { companyId: string }
) => {
  return prisma.additionalDeduction.create({ data });
};

const getAll = async (companyId: string) => {
  return prisma.additionalDeduction.findMany({ where: { companyId } });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.additionalDeduction.findFirst({
    where: { id, companyId },
  });
  if (!item)
    throw new ApiError(httpStatus.NOT_FOUND, "AdditionalDeduction not found");
  return item;
};

const update = async (
  id: string,
  data: UpdateAdditionalDeductionInput & { companyId: string }
) => {
  const existing = await prisma.additionalDeduction.findFirst({
    where: { id, companyId: data.companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "AdditionalDeduction not found");
  return prisma.additionalDeduction.update({ where: { id }, data });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.additionalDeduction.findFirst({
    where: { id, companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "AdditionalDeduction not found");
  // Soft delete by setting isActive to false
  return prisma.additionalDeduction.delete({ where: { id } });
};

export default { create, getAll, getById, update, remove };
