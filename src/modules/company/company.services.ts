import httpStatus from "http-status";
import { Company } from "@prisma/client";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import { CreateCompanyInput } from "./company.type";

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
