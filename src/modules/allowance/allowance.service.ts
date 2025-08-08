import prisma from "../../client";
import { CreateAllowanceInput, UpdateAllowanceInput } from "./allowance.type";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";

const create = async (data: CreateAllowanceInput & { companyId: string }) => {
  const allowanceDefinition = await prisma.allowanceDefinition.findFirst({
    where: {
      id: data.allowanceDefinitionId,
      companyId: data.companyId,
      isActive: true,
    },
  });
  if (!allowanceDefinition)
    throw new ApiError(httpStatus.NOT_FOUND, "Allowance definition not found");
  return prisma.allowance.create({ data });
};

const getAll = async (companyId: string) => {
  return prisma.allowance.findMany({ where: { companyId } });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.allowance.findFirst({ where: { id, companyId } });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Allowance not found");
  return item;
};

const update = async (
  id: string,
  data: UpdateAllowanceInput & { companyId: string }
) => {
  const allowanceDefinition = await prisma.allowanceDefinition.findFirst({
    where: {
      id: data.allowanceDefinitionId,
      companyId: data.companyId,
      isActive: true,
    },
  });
  if (!allowanceDefinition)
    throw new ApiError(httpStatus.NOT_FOUND, "Allowance definition not found");
  const existing = await prisma.allowance.findFirst({
    where: { id, companyId: data.companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Allowance not found");
  return prisma.allowance.update({ where: { id }, data });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.allowance.findFirst({
    where: { id, companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Allowance not found");
  return prisma.allowance.delete({ where: { id } });
};

export default { create, getAll, getById, update, remove };
