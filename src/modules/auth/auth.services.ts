import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import { Employee, TokenType } from "@prisma/client";
import prisma from "../../client";
import * as employeeService from "../employee/employee.services";
import { encryptPassword, isPasswordMatch } from "../../utils/encryption";
import ApiError from "../../utils/api-error";
import exclude from "../../utils/exclude";
import { forgotPasswordMessage } from "../../templates/sms-template";
import { formatPhoneNumberForSms } from "../../utils/format-phone-number";
import { smsQueue } from "../../queues";
import logger from "../../config/logger";

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

    const job = await smsQueue.add("send-sms", data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
    logger.info(`SMS job queued for user ${employee.id}`, {
      bulkId: data.phoneNumber,
      jobId: job.id,
    });
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
