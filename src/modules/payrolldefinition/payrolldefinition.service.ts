import prisma from "../../client";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";
import {
  CreatePayrollDefinitionInput,
  CreatePayrollDefinitionBulkInput,
  UpdatePayrollDefinitionInput,
} from "./payrolldefinition.type";

const create = async (
  data: CreatePayrollDefinitionInput & { companyId: string }
) => {
  // Prevent duplicate payrollName within company
  const exists = await prisma.payrollDefinition.findFirst({
    where: { companyId: data.companyId, payrollName: data.payrollName },
  });
  if (exists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payroll name already exists for this company"
    );
  }

  return prisma.payrollDefinition.create({
    data: {
      payrollName: data.payrollName,
      startDate: data.startDate,
      endDate: data.endDate,
      payPeriod: data.payPeriod,
      payDate: data.payDate,
      companyId: data.companyId,
    },
  });
};

const createBulk = async (
  items: CreatePayrollDefinitionBulkInput,
  companyId: string
) => {
  const names = items.map((i) => i.payrollName);
  const duplicates = await prisma.payrollDefinition.findMany({
    where: { companyId, payrollName: { in: names } },
    select: { payrollName: true },
  });
  if (duplicates.length > 0) {
    const duplicateNames = duplicates.map((d) => d.payrollName).join(", ");
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Payroll names already exist for the company: ${duplicateNames}`
    );
  }

  return prisma.payrollDefinition.createMany({
    data: items.map((i) => ({
      payrollName: i.payrollName,
      startDate: i.startDate,
      endDate: i.endDate,
      payPeriod: i.payPeriod,
      payDate: i.payDate,
      companyId,
    })),
    skipDuplicates: true,
  });
};

const getAll = async (companyId: string) => {
  return prisma.payrollDefinition.findMany({
    where: { companyId },
    orderBy: { startDate: "desc" },
  });
};

const getAllForCurrentYear = async (companyId: string) => {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59, 999));

  return prisma.payrollDefinition.findMany({
    where: {
      companyId,
      startDate: { gte: start },
      endDate: { lte: end },
    },
    orderBy: { startDate: "desc" },
  });
};

const getCurrentMonth = async (companyId: string) => {
  const now = new Date();
  const startOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );
  const endOfMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999)
  );

  return prisma.payrollDefinition.findFirst({
    where: {
      companyId,
      startDate: { gte: startOfMonth },
      endDate: { lte: endOfMonth },
    },
    orderBy: { startDate: "desc" },
  });
};

const getLatest = async (companyId: string) => {
  return prisma.payrollDefinition.findFirst({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.payrollDefinition.findFirst({
    where: { id, companyId },
  });
  if (!item)
    throw new ApiError(httpStatus.NOT_FOUND, "Payroll definition not found");
  return item;
};

const update = async (
  id: string,
  data: UpdatePayrollDefinitionInput & { companyId: string }
) => {
  const existing = await prisma.payrollDefinition.findFirst({
    where: { id, companyId: data.companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Payroll definition not found");

  if (data.payrollName && data.payrollName !== existing.payrollName) {
    const duplicate = await prisma.payrollDefinition.findFirst({
      where: { companyId: data.companyId, payrollName: data.payrollName },
      select: { id: true },
    });
    if (duplicate) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Payroll name already exists for this company"
      );
    }
  }

  return prisma.payrollDefinition.update({
    where: { id },
    data: {
      payrollName: data.payrollName ?? existing.payrollName,
      startDate: data.startDate ?? existing.startDate,
      endDate: data.endDate ?? existing.endDate,
    },
  });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.payrollDefinition.findFirst({
    where: { id, companyId },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Payroll definition not found");
  await prisma.payrollDefinition.delete({ where: { id } });
  return { id };
};

export default {
  create,
  createBulk,
  getAll,
  getAllForCurrentYear,
  getCurrentMonth,
  getLatest,
  getById,
  update,
  remove,
};
