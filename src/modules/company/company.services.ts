import httpStatus from "http-status";
import { Company } from "@prisma/client";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import { CreateCompanyInput, UpdateCompanyInput } from "./company.type";

/**
 * Create a company
 * @param {Object} data - Company data
 * @returns {Promise<Company>}
 */
export const createCompany = async (
  data: CreateCompanyInput
): Promise<Company> => {
  const { organizationName, phoneNumber, companyCode, email, notes } = data;
  if (email && (await getCompanyByEmail(email))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  return prisma.company.create({
    data: {
      organizationName,
      phoneNumber,
      companyCode,
      email,
      notes,
    },
  });
};

/**
 * Get company by email
 * @param {string} email
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Company, Key> | null>}
 */
export const getCompanyByEmail = async <Key extends keyof Company>(
  email: string,
  keys: Key[] = [
    "id",
    "email",
    "organizationName",
    "phoneNumber",
    "companyCode",
    "createdAt",
    "updatedAt",
  ] as Key[]
): Promise<Pick<Company, Key> | null> => {
  return prisma.company.findFirst({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Company, Key> | null>;
};

export const getCompanyProfile = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  return company;
};

export const updateCompanyProfile = async (
  companyId: string,
  updates: UpdateCompanyInput
): Promise<Company> => {
  const existing = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  if (updates.email && updates.email !== existing.email) {
    const emailTaken = await prisma.company.findFirst({
      where: { email: updates.email },
    });
    if (emailTaken) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
    }
  }

  return prisma.company.update({
    where: { id: companyId },
    data: updates,
  });
};
