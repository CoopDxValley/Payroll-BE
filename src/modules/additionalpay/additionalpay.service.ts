import httpStatus from "http-status";
import prisma from "../../client";
import {
  CreateAdditionalPayInput,
  UpdateAdditionalPayInput,
} from "./additionalpay.type";
import ApiError from "../../utils/api-error";

const create = async (
  data: CreateAdditionalPayInput & { companyId: string }
) => {
  return prisma.additionalPay.create({ data });
};

const getAll = async (companyId: string) => {
  return prisma.additionalPay.findMany({ where: { companyId } });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.additionalPay.findFirst({
    where: { id, companyId },
  });
  if (!item)
    throw new ApiError(httpStatus.NOT_FOUND, "AdditionalPay not found");
  return item;
};

const update = async (
  id: string,
  data: UpdateAdditionalPayInput & { companyId: string }
) => {
  const existing = await prisma.additionalPay.findFirst({
    where: { id, companyId: data.companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "AdditionalPay not found");
  return prisma.additionalPay.update({ where: { id }, data });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.additionalPay.findFirst({
    where: { id, companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "AdditionalPay not found");
  return prisma.additionalPay.delete({ where: { id } });
};

export default { create, getAll, getById, update, remove };
