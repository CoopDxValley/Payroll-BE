import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import moment, { Moment } from "moment";
import jwt from "jsonwebtoken";
import { Employee, Token, TokenType } from "@prisma/client";
import prisma from "../../client";
import * as employeeService from "../employee/employee.services";
import { encryptPassword, isPasswordMatch } from "../../utils/encryption";
import ApiError from "../../utils/api-error";
import exclude from "../../utils/exclude";
import { forgotPasswordMessage } from "../../templates/sms-template";
import { formatPhoneNumberForSms } from "../../utils/format-phone-number";
// import { smsQueue } from "../../queues";
import logger from "../../config/logger";
import { AuthTokensResponse } from "./auth.type";
import config from "../../config/config";

/**
 * Login with username and password
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Omit<Employee, 'password'>>}
 */
export const loginEmployeeWithUsernameAndPassword = async (
  username: string,
  password: string
): Promise<Omit<Employee, "password">> => {
  const employee = await employeeService.getEmployeeByUsername(username, [
    "id",
    "username",
    "name",
    "password",
    "phoneNumber",
    "isFirstTimeLoggedIn",
    "isSuperAdmin",
    "companyId",
    "deviceUserId",
    "attendanceRequirement",
    "positionId",
    "departmentId",
    "createdAt",
    "updatedAt",
  ]);
  if (
    !employee ||
    !(await isPasswordMatch(password, employee.password as string))
  ) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Incorrect username or password"
    );
  }
  return exclude(employee, ["password"]);
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise<void>}
 */
export const logout = async (refreshToken: string): Promise<void> => {
  const refreshTokenData = await prisma.token.findFirst({
    where: {
      token: refreshToken,
      type: TokenType.REFRESH,
      blacklisted: false,
    },
  });
  if (!refreshTokenData) {
    throw new ApiError(httpStatus.NOT_FOUND, "Not found");
  }
  await prisma.token.delete({ where: { id: refreshTokenData.id } });
};

/**
 * Reset password for a employee
 * @param {string} username - Employee's username
 * @param {string} password - New password
 * @returns {Promise<Omit<Employee, 'password'>>}
 */
export const resetPassword = async (
  username: string,
  password: string
): Promise<Omit<Employee, "password">> => {
  const [hashedPassword, employee] = await Promise.all([
    encryptPassword(password),
    prisma.employee.findUnique({
      where: { username },
      select: { id: true },
    }),
  ]);

  if (!employee) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Employee does not exist");
  }

  const updatedEmployee = await prisma.employee.update({
    where: { id: employee.id },
    data: {
      isFirstTimeLoggedIn: false,
      password: hashedPassword,
    },
  });

  return exclude(updatedEmployee, ["password"]);
};

export const forgotPassword = async (username: string) => {
  // const password = generateRandomPassword();
  const password = "SuperSecurePassword12";
  const [hashedPassword, employee] = await Promise.all([
    encryptPassword(password),
    prisma.employee.findUnique({
      where: { username },
      select: { id: true },
    }),
  ]);

  if (!employee)
    throw new ApiError(httpStatus.BAD_REQUEST, "Employee does not exist");

  const updatedEmployee = await prisma.employee.update({
    where: { id: employee.id },
    data: {
      isFirstTimeLoggedIn: true,
      password: hashedPassword,
    },
  });
  try {
    const message = forgotPasswordMessage(
      updatedEmployee.name,
      updatedEmployee.username,
      password
    );
    const data = {
      phoneNumber: formatPhoneNumberForSms(updatedEmployee.phoneNumber),
      message,
      jobId: uuidv4(),
      type: "forgotPassword",
    };

    // const job = await smsQueue.add("send-sms", data, {
    //   attempts: 3,
    //   backoff: { type: "exponential", delay: 1000 },
    // });
    // logger.info(`SMS job queued for user ${employee.id}`, {
    //   bulkId: data.phoneNumber,
    //   jobId: job.id,
    // });
  } catch (error) {
    logger.error(
      `Failed to queue send sms job for forgotPassword ${employee.id}`,
      {
        error,
      }
    );
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "send forgot SMS processing failed"
    );
  }

  return exclude(updatedEmployee, ["password"]);
};

/**
 * Generate token
 * @param {string} userId
 * @param {string} companyId
 * @param {boolean} isSuperAdmin
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (
  employeeId: string,
  companyId: string,
  departmentId: string | null,
  isSuperAdmin: boolean,
  expires: Moment,
  type: TokenType,
  secret = config.jwt.secret
): string => {
  const payload = {
    sub: { employeeId, companyId, departmentId, isSuperAdmin },
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {string} employeeId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (
  token: string,
  employeeId: string,
  expires: Moment,
  type: TokenType,
  blacklisted = false
): Promise<Token> => {
  const createdToken = prisma.token.create({
    data: {
      token,
      employeeId,
      expires: expires.toDate(),
      type,
      blacklisted,
    },
  });
  return createdToken;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token: string, type: TokenType): Promise<Token> => {
  const payload = jwt.verify(token, config.jwt.secret);
  const employeeId = payload.sub as string;
  const tokenData = await prisma.token.findFirst({
    where: { token, type, employeeId, blacklisted: false },
  });
  if (!tokenData) {
    throw new Error("Token not found");
  }
  return tokenData;
};

/**
 * Generate auth tokens
 * @param {Employee} employee
 * @returns {Promise<AuthTokensResponse>}
 */
export const generateAuthTokens = async (employee: {
  id: string;
  companyId: string;
  isSuperAdmin: boolean;
  departmentId: string | null;
}): Promise<AuthTokensResponse> => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes"
  );
  const accessToken = generateToken(
    employee.id,
    employee.companyId,
    employee.departmentId,
    employee.isSuperAdmin,
    accessTokenExpires,
    TokenType.ACCESS
  );

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days"
  );
  const refreshToken = generateToken(
    employee.id,
    employee.companyId,
    employee.departmentId,
    employee.isSuperAdmin,
    refreshTokenExpires,
    TokenType.REFRESH
  );
  await saveToken(
    refreshToken,
    employee.id,
    refreshTokenExpires,
    TokenType.REFRESH
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};
