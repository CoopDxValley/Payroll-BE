import httpStatus from "http-status";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import { CreatePensionInput, UpdatePensionInput } from "./pension.type";

const getDefaultPension = async () => {
  return await prisma.pension.findMany({ where: { isDefault: true } });
};

const getCompanyPension = async (companyId: string) => {
  const companyTaxRules = await prisma.companyPensionRule.findMany({
    where: { companyId, isActive: true },
    select: {
      pension: {
        select: {
          id: true,
          employeeContribution: true,
          employerContribution: true,
        },
      },
    },
  });

  const pensions = companyTaxRules.map((rule) => rule.pension);

  return pensions;
};

const addCompanyPension = async (
  data: CreatePensionInput & { companyId: string }
) => {
  const { companyId, ...pensionData } = data;
  const existing = await prisma.companyPensionRule.findFirst({
    where: {
      companyId: data.companyId,
      pension: {
        employeeContribution: data.employeeContribution,
        employerContribution: data.employerContribution,
      },
    },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Pension rule already exists for this contribution range"
    );
  }
  const newPension = await prisma.pension.create({
    data: {
      ...pensionData,
    },
  });

  const companyPensionRule = await prisma.companyPensionRule.create({
    data: {
      companyId: data.companyId,
      pensionId: newPension.id,
      isActive: true,
    },
  });

  return companyPensionRule;
};

const removeCompanyPensionRule = async (companyId: string, ruleId: string) => {
  const existingRule = await prisma.companyPensionRule.findUnique({
    where: { id: ruleId, companyId },
  });

  if (!existingRule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Pension rule not found");
  }

  const removedPensionRules = await prisma.companyPensionRule.update({
    where: { id: ruleId, companyId },
    data: { isActive: false },
  });

  return removedPensionRules;
};

const resetCompanyPensionRules = async (companyId: string) => {
  // Validate company existence
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Deactivate all current pension rules for the company
  const deactivatePensionRules = await prisma.companyPensionRule.updateMany({
    where: { companyId, isActive: true },
    data: { isActive: false },
  });

  // Fetch default pension rules
  const defaultPensionFunds = await prisma.pension.findMany({
    where: { isDefault: true },
  });

  if (defaultPensionFunds.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No default pension funds found");
  }

  // Assign default pension funds to company
  for (const fund of defaultPensionFunds) {
    await prisma.companyPensionRule.upsert({
      where: {
        companyId_pensionId: { companyId, pensionId: fund.id },
      },
      update: { isActive: true },
      create: {
        companyId,
        pensionId: fund.id,
        isActive: true,
      },
    });
  }

  return defaultPensionFunds;
};

const assignDefaultPensionFundsToCompany = async (companyId: string) => {
  // Validate company existence
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Fetch default pension funds
  const defaultPensionFunds = await prisma.pension.findMany({
    where: { isDefault: true },
  });

  if (defaultPensionFunds.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, "No default pension funds found");
  }

  // Assign default pension funds to company, skip if already assigned and active
  for (const fund of defaultPensionFunds) {
    const existingRule = await prisma.companyPensionRule.findUnique({
      where: {
        companyId_pensionId: { companyId, pensionId: fund.id },
      },
    });

    if (existingRule && existingRule.isActive) {
      continue; // Already assigned and active
    }

    await prisma.companyPensionRule.upsert({
      where: {
        companyId_pensionId: { companyId, pensionId: fund.id },
      },
      update: { isActive: true },
      create: {
        companyId,
        pensionId: fund.id,
        isActive: true,
      },
    });
  }

  return defaultPensionFunds;
};

const getPensionFundById = async (pensionFundId: string) => {
  if (!pensionFundId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Pension fund ID is required");
  }

  const pensionFund = await prisma.pension.findUnique({
    where: { id: pensionFundId },
  });

  if (!pensionFund) {
    throw new ApiError(httpStatus.NOT_FOUND, "Pension fund not found");
  }

  return pensionFund;
};

const update = async (ruleId: string, data: UpdatePensionInput) => {
  const existingRule = await prisma.companyPensionRule.findUnique({
    where: { id: ruleId },
  });

  if (!existingRule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Pension rule not found");
  }

  const updatedRule = await prisma.companyPensionRule.update({
    where: { id: ruleId },
    data: {
      ...data,
      companyId: existingRule.companyId,
    },
  });

  return updatedRule;
};

export default {
  getDefaultPension,
  getCompanyPension,
  addCompanyPension,
  removeCompanyPensionRule,
  resetCompanyPensionRules,
  assignDefaultPensionFundsToCompany,
  getPensionFundById,
  update,
};
