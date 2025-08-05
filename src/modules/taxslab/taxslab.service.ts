import httpStatus from "http-status";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import { CreateTaxslabInput } from "./taxslab.type";

const getDefaultTaxSlab = async () => {
  const taxslab = await prisma.taxSlab.findMany({ where: { isDefault: true } });

  return taxslab;
};

const getDefaultProvidentFund = async () => {
  return await prisma.providentFund.findMany({ where: { isDefault: true } });
};

const getCompanyTaxRules = async (companyId: string) => {
  const companyTaxRules = await prisma.companyTaxRule.findMany({
    where: { companyId, isActive: true },
    include: { taxSlab: true },
  });

  return companyTaxRules;
};

const addCompanyTaxslab = async (
  data: CreateTaxslabInput & { companyId: string }
) => {
  const { companyId, ...taxSlabData } = data;
  const existing = await prisma.companyTaxRule.findFirst({
    where: {
      companyId: data.companyId,
      taxSlab: {
        minIncome: data.minIncome,
        maxIncome: data.maxIncome,
      },
    },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Tax slab already exists for this income range"
    );
  }

  const newTaxslab = await prisma.taxSlab.create({
    data: {
      ...taxSlabData,
    },
  });

  const companyTaxRule = await prisma.companyTaxRule.create({
    data: {
      companyId: data.companyId,
      taxSlabId: newTaxslab.id,
      isActive: true,
    },
  });

  return companyTaxRule;
};

const removeCompanyTaxRule = async (companyId: string, ruleId: string) => {
  const existingRule = await prisma.companyTaxRule.findUnique({
    where: { id: ruleId, companyId },
  });

  if (!existingRule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tax rule not found");
  }

  const removedTaxRules = await prisma.companyTaxRule.update({
    where: { id: ruleId, companyId },
    data: { isActive: false },
  });

  return removedTaxRules;
};

const resetCompanyTaxRules = async (companyId: string) => {
  // Validate company existence
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Deactivate all current tax rules for the company
  const deactivateTaxrules = await prisma.companyTaxRule.updateMany({
    where: { companyId, isActive: true },
    data: { isActive: false },
  });

  // Fetch default tax slabs
  const defaultTaxSlabs = await prisma.taxSlab.findMany({
    where: { isDefault: true },
  });

  if (defaultTaxSlabs.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No default tax slabs found");
  }

  // Assign default tax slabs to company
  for (const slab of defaultTaxSlabs) {
    await prisma.companyTaxRule.upsert({
      where: {
        companyId_taxSlabId: { companyId, taxSlabId: slab.id },
      },
      update: { isActive: true },
      create: {
        companyId,
        taxSlabId: slab.id,
        isActive: true,
      },
    });
  }

  return defaultTaxSlabs;
};

const assignDefaultTaxRulesToCompany = async (companyId: string) => {
  // Validate company existence
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Fetch default tax slabs
  const defaultTaxSlabs = await prisma.taxSlab.findMany({
    where: { isDefault: true },
  });

  if (defaultTaxSlabs.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No default tax slabs found");
  }

  // Assign default tax slabs to company, skip if already assigned and active
  for (const slab of defaultTaxSlabs) {
    const existingRule = await prisma.companyTaxRule.findUnique({
      where: {
        companyId_taxSlabId: { companyId, taxSlabId: slab.id },
      },
    });

    if (existingRule && existingRule.isActive) {
      continue; // Already assigned and active
    }

    await prisma.companyTaxRule.upsert({
      where: {
        companyId_taxSlabId: { companyId, taxSlabId: slab.id },
      },
      update: { isActive: true },
      create: {
        companyId,
        taxSlabId: slab.id,
        isActive: true,
      },
    });
  }

  return defaultTaxSlabs;
};

const getTaxslabById = async (taxId: string) => {
  if (!taxId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Tax slab ID is required");
  }

  const taxslab = await prisma.taxSlab.findUnique({ where: { id: taxId } });

  if (!taxslab) {
    throw new ApiError(httpStatus.NOT_FOUND, "Tax slab not found");
  }

  return taxslab;
};

export default {
  getDefaultTaxSlab,
  getDefaultProvidentFund,
  getCompanyTaxRules,
  addCompanyTaxslab,
  removeCompanyTaxRule,
  resetCompanyTaxRules,
  assignDefaultTaxRulesToCompany,
  getTaxslabById,
};
