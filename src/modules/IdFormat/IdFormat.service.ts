import { PrismaClient, Separator } from "@prisma/client";
import httpStatus from "http-status";
import { CreateIdFormatInput } from "./Idformat.type";
import ApiError from "../../utils/api-error";

const prisma = new PrismaClient();

const toPrismaSeparator = (v?: string): Separator | undefined => {
  if (!v) return undefined;
  if (v === "SLASH" || v === "DASH") return v as Separator;
  // Should never happen due to Zod transform, but keep safe:
  if (v === "/") return "SLASH";
  if (v === "-") return "DASH";
  return undefined;
};

const fromPrismaSeparator = (v: Separator) => (v === "SLASH" ? "/" : "-");

export const createIdFormat = async (
  data: CreateIdFormatInput & { companyId: string }
) => {
  // Enforce 1:1 per company (like your Sequelize check)
  const existing = await prisma.idFormat.findUnique({
    where: { companyId: data.companyId },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "A resource with this ID already exists. Please update it instead"
    );
  }

  const created = await prisma.idFormat.create({
    data: {
      companyCode: data.companyCode,
      year: data.year,
      department: data.department,
      separator: toPrismaSeparator(data.separator) ?? "SLASH",
      isActive: data.isActive ?? true,
      digitLength: data.digitLength ?? 5,
      order: data.order,
      company: { connect: { id: data.companyId } },
    },
  });

  return {
    ...created,
    separatorSymbol: fromPrismaSeparator(created.separator),
  };
};

export const getCompanyIdFormats = async (companyId: string) => {
  const rows = await prisma.idFormat.findMany({
    where: { companyId },
    // orderBy: { createdAt: "desc" }, // if you have timestamps; remove if not present
  });

  return rows.map((r) => ({
    ...r,
    separatorSymbol: fromPrismaSeparator(r.separator),
  }));
};

export const getActiveIdFormatForCompany = async (companyId: string) => {
  const row = await prisma.idFormat.findFirst({
    where: { companyId, isActive: true },
  });
  if (!row) {
    throw new ApiError(httpStatus.NOT_FOUND, "Resource not found");
  }
  return { ...row, separatorSymbol: fromPrismaSeparator(row.separator) };
};

export const updateIdFormat = async (
  companyId: string,
  id: string,
  body: Partial<CreateIdFormatInput>
) => {
  // Ensure the record exists and belongs to the same company
  const existing = await prisma.idFormat.findUnique({ where: { id } });
  if (!existing || existing.companyId !== companyId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Invalid request data");
  }

  const updated = await prisma.idFormat.update({
    where: { id },
    data: {
      companyCode: body.companyCode ?? undefined,
      year: body.year ?? undefined,
      department: body.department ?? undefined,
      separator: toPrismaSeparator(body.separator),
      isActive: body.isActive ?? undefined,
      digitLength: body.digitLength ?? undefined,
      order: body.order ?? undefined,
    },
  });

  return {
    ...updated,
    separatorSymbol: fromPrismaSeparator(updated.separator),
  };
};

export const deleteIdFormatById = async (companyId: string, id: string) => {
  // Ensure the record exists and belongs to the same company
  const existing = await prisma.idFormat.findUnique({ where: { id } });
  if (!existing || existing.companyId !== companyId) {
    throw new ApiError(httpStatus.NOT_FOUND, "Resource not found");
  }

  await prisma.idFormat.delete({ where: { id } });
  return { message: "Id Format deleted successfully" };
};
