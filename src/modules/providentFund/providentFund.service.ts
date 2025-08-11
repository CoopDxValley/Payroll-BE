import httpStatus from "http-status";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import { CreateProvidentFundInput } from "./providentFund.type";

const getDefaultProvidentFund = async () => {
  return await prisma.providentFund.findMany({ where: { isDefault: true } });
};

const getCompanyProvidentFund = async (companyId: string) => {
  const companyTaxRules = await prisma.companyProvidentFundRule.findMany({
    where: { companyId, isActive: true },
    select: {
      id: true,
      providentFund: {
        select: {
          id: true,
          employeeContribution: true,
          employerContribution: true,
        },
      },
    },
  });

  const providentFunds = companyTaxRules.map((rule) => ({
    id: rule.id,
    employeeContribution: rule.providentFund.employeeContribution,
    employerContribution: rule.providentFund.employerContribution,
  }));

  return providentFunds;
};

const addCompanyProvidentFund = async (
  data: CreateProvidentFundInput & { companyId: string }
) => {
  const { companyId, ...providentFundData } = data;
  const existing = await prisma.companyProvidentFundRule.findFirst({
    where: {
      companyId: data.companyId,
      isActive: true,
      providentFund: {
        employeeContribution: data.employeeContribution,
        employerContribution: data.employerContribution,
      },
    },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Provident fund rule already exists for this contribution range"
    );
  }

  const newProvidentFund = await prisma.providentFund.create({
    data: {
      ...providentFundData,
    },
  });

  const companyProvidentFundRule = await prisma.companyProvidentFundRule.create(
    {
      data: {
        companyId: data.companyId,
        providentFundId: newProvidentFund.id,
        isActive: true,
      },
    }
  );

  return companyProvidentFundRule;
};

const removeCompanyProvidentFundRule = async (
  companyId: string,
  ruleId: string
) => {
  const existingRule = await prisma.companyProvidentFundRule.findUnique({
    where: { id: ruleId, companyId },
  });

  if (!existingRule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Provident fund rule not found");
  }

  const removedProvidentFundRules =
    await prisma.companyProvidentFundRule.update({
      where: { id: ruleId, companyId },
      data: { isActive: false },
    });

  return removedProvidentFundRules;
};

const resetCompanyProvidentFundRules = async (companyId: string) => {
  // Validate company existence
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Deactivate all current provident fund rules for the company
  const deactivateProvidentFundRules =
    await prisma.companyProvidentFundRule.updateMany({
      where: { companyId, isActive: true },
      data: { isActive: false },
    });

  // Fetch default provident fund rules
  const defaultProvidentFunds = await prisma.providentFund.findMany({
    where: { isDefault: true },
  });

  if (defaultProvidentFunds.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No default provident funds found"
    );
  }

  // Assign default provident funds to company
  for (const fund of defaultProvidentFunds) {
    await prisma.companyProvidentFundRule.upsert({
      where: {
        companyId_providentFundId: { companyId, providentFundId: fund.id },
      },
      update: { isActive: true },
      create: {
        companyId,
        providentFundId: fund.id,
        isActive: true,
      },
    });
  }

  return defaultProvidentFunds;
};

const assignDefaultProvidentFundsToCompany = async (companyId: string) => {
  // Validate company existence
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  // Fetch default provident funds
  const defaultProvidentFunds = await prisma.providentFund.findMany({
    where: { isDefault: true },
  });

  if (defaultProvidentFunds.length === 0) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No default provident funds found"
    );
  }

  // Assign default provident funds to company, skip if already assigned and active
  for (const fund of defaultProvidentFunds) {
    const existingRule = await prisma.companyProvidentFundRule.findUnique({
      where: {
        companyId_providentFundId: { companyId, providentFundId: fund.id },
      },
    });

    if (existingRule && existingRule.isActive) {
      continue; // Already assigned and active
    }

    await prisma.companyProvidentFundRule.upsert({
      where: {
        companyId_providentFundId: { companyId, providentFundId: fund.id },
      },
      update: { isActive: true },
      create: {
        companyId,
        providentFundId: fund.id,
        isActive: true,
      },
    });
  }

  return defaultProvidentFunds;
};

const getProvidentFundById = async (providentFundId: string) => {
  if (!providentFundId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Provident fund ID is required");
  }

  const providentFund = await prisma.providentFund.findUnique({
    where: { id: providentFundId },
  });

  if (!providentFund) {
    throw new ApiError(httpStatus.NOT_FOUND, "Provident fund not found");
  }

  return providentFund;
};

const update = async (
  ruleId: string,
  data: CreateProvidentFundInput & { companyId: string }
) => {
  const existingRule = await prisma.companyProvidentFundRule.findUnique({
    where: {
      id: ruleId,
      isActive: true,
    },
  });

  if (!existingRule) {
    throw new ApiError(httpStatus.NOT_FOUND, "Provident Fund rule not found");
  }

  const updatedRule = await prisma.companyProvidentFundRule.update({
    where: { id: ruleId },
    data: {
      isActive: false,
    },
  });

  const createdRule = await addCompanyProvidentFund({
    ...data,
    companyId: existingRule.companyId,
  });

  return createdRule;
};

export default {
  getDefaultProvidentFund,
  getCompanyProvidentFund,
  addCompanyProvidentFund,
  update,
  removeCompanyProvidentFundRule,
  resetCompanyProvidentFundRules,
  assignDefaultProvidentFundsToCompany,
  getProvidentFundById,
};
