import prisma from "../../client";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";

const create = async (data: {
  name: string;
  type: "AMOUNT" | "PERCENT";
  companyId: string;
}) => {
  const { name, type, companyId } = data;

  if (!name || !companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields.");
  }

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
    data: {
      name: name.trim(),
      type,
      companyId,
    },
  });
};

const getAll = async (companyId: string) => {
  return prisma.additionalDeductionDefinition.findMany({
    where: { companyId, isActive: true },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string) => {
  return prisma.additionalDeductionDefinition.findUnique({ where: { id } });
};

const update = async (
  id: string,
  data: Partial<{ name: string; type: "AMOUNT" | "PERCENT" }>
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
