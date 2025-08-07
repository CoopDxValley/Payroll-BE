import httpStatus from "http-status";
import { CreateDeductionInput, UpdateDeductionInput } from "./deduction.type";
import prisma from "../../client";
import ApiError from "../../utils/api-error";

const create = async (data: CreateDeductionInput & { companyId: string }) => {
  return prisma.deduction.create({ data });
};

const getAll = async (companyId: string) => {
  return prisma.deduction.findMany({ where: { companyId } });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.deduction.findFirst({ where: { id, companyId } });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Deduction not found");
  return item;
};

const update = async (
  id: string,
  data: UpdateDeductionInput & { companyId: string }
) => {
  const existing = await prisma.deduction.findFirst({
    where: { id, companyId: data.companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Deduction not found");
  return prisma.deduction.update({ where: { id }, data });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.deduction.findFirst({
    where: { id, companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Deduction not found");
  return prisma.deduction.delete({ where: { id } });
};

export default { create, getAll, getById, update, remove };
