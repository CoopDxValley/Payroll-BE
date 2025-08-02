import { Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import employeeService from "./employee.services";
import {
  AssignEmployeeToDepartmentBody,
  AssignEmployeeToPositionBody,
  CreateEmployeeInput,
  GetEmployeeInfoByIdParams,
  getEmployeesQuery,
} from "./employee.type";
import { AuthEmployee } from "../auth/auth.type";
import exclude from "../../utils/exclude";
import pick from "../../utils/pick";
import { CustomRequest } from "../../middlewares/validate";

export const registerEmployee = catchAsync<
  CustomRequest<never, never, CreateEmployeeInput>
>(
  async (
    req: CustomRequest<never, never, CreateEmployeeInput>,
    res: Response
  ) => {
    const input = req.body;
    const authEmployee = req.employee as AuthEmployee;
    const companyId = authEmployee.companyId;
    const employee = await employeeService.createEmployee({
      ...input,
      companyId,
    });

    const employeeWithOutPassword = exclude(employee, [
      "password",
      "createdAt",
      "updatedAt",
    ]);
    res.status(httpStatus.CREATED).send({
      data: employeeWithOutPassword,
      message: "Employee created successfully!",
    });
  }
);

export const getEmployees = catchAsync<
  CustomRequest<never, getEmployeesQuery, never>
>(
  async (
    req: CustomRequest<never, getEmployeesQuery, never>,
    res: Response
  ) => {
    const authEmployee = req.employee as AuthEmployee;
    const options = pick(req.query, ["sortBy", "sortType", "limit", "page"]);
    const result = await employeeService.queryEmployee(
      authEmployee.companyId,
      options
    );
    res
      .status(httpStatus.CREATED)
      .send({ data: result, message: "Employee retrieved successfully" });
  }
);

export const getEmployeeInfoById = catchAsync<
  CustomRequest<never, GetEmployeeInfoByIdParams, never>
>(
  async (
    req: CustomRequest<never, GetEmployeeInfoByIdParams, never>,
    res: Response
  ) => {
    const { employeeId } = req.params;

    const result = await employeeService.getEmployeeInfoById(employeeId);

    res
      .status(httpStatus.OK)
      .send({ data: result, message: "Employee retrieved successfully" });
  }
);

export const assignEmployeeToDepartment = catchAsync<
  CustomRequest<never, never, AssignEmployeeToDepartmentBody>
>(
  async (
    req: CustomRequest<never, never, AssignEmployeeToDepartmentBody>,
    res: Response
  ) => {
    const { employeeId, departmentId } = req.body;
    const result = await employeeService.assignEmployeeToDepartment(
      employeeId,
      departmentId
    );

    res.status(httpStatus.OK).send({
      data: result,
      message: "Employee assigned to department successfully",
    });
  }
);

export const assignEmployeeToPosition = catchAsync<
  CustomRequest<never, never, AssignEmployeeToPositionBody>
>(
  async (
    req: CustomRequest<never, never, AssignEmployeeToPositionBody>,
    res: Response
  ) => {
    const { employeeId, positionId } = req.body;

    const result = await employeeService.assignEmployeeToPosition(
      employeeId,
      positionId
    );

    res.status(httpStatus.OK).send({
      data: result,
      message: "Employee assigned to position successfully",
    });
  }
);
