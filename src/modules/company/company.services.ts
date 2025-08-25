import httpStatus from "http-status";
import { Company } from "@prisma/client";
import prisma from "../../client";
import ApiError from "../../utils/api-error";
import { CreateCompanyInput, UpdateCompanyInput } from "./company.type";
import taxslabService from "../taxslab/taxslab.service";
import { encryptPassword } from "../../utils/encryption";

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

  const existingCompany = await getCompanyByKey("companyCode", companyCode);
  if (existingCompany) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Company code already taken");
  }

  const existingCompanyByOrganizationName = await getCompanyByKey(
    "organizationName",
    organizationName
  );
  if (existingCompanyByOrganizationName) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Organization name already taken"
    );
  }

  const company = await prisma.company.create({
    data: {
      organizationName,
      phoneNumber,
      companyCode,
      email,
      notes,
    },
  });
  await taxslabService.assignDefaultTaxRulesToCompany(company.id);

  const hashedPassword = await encryptPassword("ZuquallaAdmin@123");

  const employee = await prisma.employee.create({
    data: {
      name: "zuquall Admin",
      username: "zuquall.admin",
      phoneNumber: phoneNumber,
      password: hashedPassword,
      companyId: company.id,
      gender: "MALE",
    },
  });

  const adminRole = await prisma.role.create({
    data: {
      name: "Admin",
      companyId: company.id,
    },
  });

  const permissions = await prisma.permission.findMany();

  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  await prisma.employeeRoleHistory.create({
    data: {
      employeeId: employee.id,
      roleId: adminRole.id,
      fromDate: new Date(),
    },
  });

  return company;
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

/**
 * Get company by key
 * @param {Array<Key>} key
 * @returns {Promise<Pick<Company, Key> | null>}
 */
export const getCompanyByKey = async <Key extends keyof Company>(
  key: Key,
  value: Company[Key],
  selectKeys: Key[] = [
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
    where: { [key]: value },
    select: selectKeys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
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
