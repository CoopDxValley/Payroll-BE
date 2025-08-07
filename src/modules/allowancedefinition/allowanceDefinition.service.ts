import prisma from "../../client";
import {
  CreateAllowanceDefinitionInput,
  UpdateAllowanceDefinitionInput,
} from "./allowanceDefinition.type";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";
import { Prisma } from "@prisma/client";

const create = async (
  data: CreateAllowanceDefinitionInput & { companyId: string }
) => {
  // Convert string decimals to Prisma Decimal if needed
  return prisma.allowanceDefinition.create({
    data: {
      ...data,
      exemptedAmount: data.exemptedAmount
        ? new Prisma.Decimal(data.exemptedAmount)
        : 0,
      startingAmount: data.startingAmount
        ? new Prisma.Decimal(data.startingAmount)
        : undefined,
    },
  });
};

const getAll = async (companyId: string) => {
  return prisma.allowanceDefinition.findMany({
    where: { companyId, isActive: true },
  });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.allowanceDefinition.findFirst({
    where: { id, companyId },
  });
  if (!item)
    throw new ApiError(httpStatus.NOT_FOUND, "AllowanceDefinition not found");
  return item;
};

const update = async (
  id: string,
  data: UpdateAllowanceDefinitionInput & { companyId: string }
) => {
  const existing = await prisma.allowanceDefinition.findFirst({
    where: { id, companyId: data.companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "AllowanceDefinition not found");
  return prisma.allowanceDefinition.update({
    where: { id },
    data: {
      ...data,
      exemptedAmount: data.exemptedAmount
        ? new Prisma.Decimal(data.exemptedAmount)
        : undefined,
      startingAmount: data.startingAmount
        ? new Prisma.Decimal(data.startingAmount)
        : undefined,
    },
  });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.allowanceDefinition.findFirst({
    where: { id, companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "AllowanceDefinition not found");
  return await prisma.allowanceDefinition.update({
    where: { id },
    data: { isActive: false },
  });
  // return prisma.allowanceDefinition.delete({ where: { id } });
};

export default { create, getAll, getById, update, remove };
