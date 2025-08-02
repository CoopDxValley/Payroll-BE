import prisma from "../../client";
import ApiError from "../../utils/api-error";
import httpStatus from "http-status";

const create = async (data: {
  name: string;
  type: "AMOUNT" | "PERCENT";
  companyId: string;
}) => {
  const existing = await prisma.additionalPayDefinition.findFirst({
    where: {
      name: data.name.trim(),
      companyId: data.companyId,
      isActive: true,
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.CONFLICT,
      "Name already exists for this company."
    );
  }

  return prisma.additionalPayDefinition.create({
    data: {
      name: data.name.trim(),
      type: data.type,
      companyId: data.companyId,
    },
  });
};

const getAll = async (companyId: string) => {
  console.log("dkljdfdjfhdfhddfdfdfdi");
  console.log(companyId);
  return prisma.additionalPayDefinition.findMany({
    where: {
      companyId,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const getById = async (id: string, companyId: string) => {
  const item = await prisma.additionalPayDefinition.findFirst({
    where: { id, companyId, isActive: true },
  });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, "Definition not found");
  return item;
};

const update = async (
  id: string,
  data: Partial<{ name: string; type: "AMOUNT" | "PERCENT" }>,
  companyId: string
) => {
  const existing = await prisma.additionalPayDefinition.findFirst({
    where: { id, companyId, isActive: true },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Definition not found");

  if (data.name && data.name !== existing.name) {
    const nameTaken = await prisma.additionalPayDefinition.findFirst({
      where: {
        name: data.name.trim(),
        companyId,
        isActive: true,
        NOT: { id },
      },
    });
    if (nameTaken)
      throw new ApiError(httpStatus.CONFLICT, "Name already exists");
  }

  return prisma.additionalPayDefinition.update({
    where: { id },
    data: {
      name: data.name?.trim(),
      type: data.type,
    },
  });
};

const remove = async (id: string, companyId: string) => {
  const existing = await prisma.additionalPayDefinition.findFirst({
    where: { id, companyId, isActive: true },
  });
  if (!existing)
    throw new ApiError(httpStatus.NOT_FOUND, "Definition not found");

  return prisma.additionalPayDefinition.update({
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
