import httpStatus from "http-status";
import * as authService from "./auth.services";
import employeeService from "../employee/employee.services";
import catchAsync from "../../utils/catch-async";
import {
  AuthEmployee,
  ForgotPasswordInput,
  LoginEmployeeInput,
  LogoutEmployeeInput,
} from "./auth.type";
import ApiError from "../../utils/api-error";

export const login = catchAsync(async (req, res) => {
  const input: LoginEmployeeInput = req.body;
  const employee = await authService.loginEmployeeWithUsernameAndPassword(
    input.username,
    input.password
  );
  const permissions = await employeeService.getEmployeePermissions(employee.id);
  const tokens = await authService.generateAuthTokens(employee);
  res.send({ employee, tokens, permissions });
});

export const logout = catchAsync(async (req, res) => {
  const input: LogoutEmployeeInput = req.body;
  await authService.logout(input.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

export const me = catchAsync(async (req, res) => {
  const employee = req.employee as AuthEmployee;
  if (!employee) throw new ApiError(httpStatus.BAD_REQUEST, "Please Login");
  res
    .status(httpStatus.OK)
    .send({ data: employee, message: "Employee retrieved successfully" });
});

export const resetPassword = catchAsync(async (req, res) => {
  const input: LoginEmployeeInput = req.body;
  await authService.resetPassword(input.username, input.password);
  res.status(httpStatus.NO_CONTENT).send();
});

export const forgotPassword = catchAsync(async (req, res) => {
  const input: ForgotPasswordInput = req.body;
  await authService.forgotPassword(input.username);
  res.status(httpStatus.NO_CONTENT).send();
});
