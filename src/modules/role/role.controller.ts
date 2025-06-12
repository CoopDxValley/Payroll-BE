import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import * as employeeService from "./role.services";
import { CreateEmployeeInput } from "./employee.type";

export const registerEmployee = catchAsync(async (req, res) => {
  const input: CreateEmployeeInput = req.body;
  // const company = await employeeService.createEmployee(input);
  // res
  //   .status(httpStatus.CREATED)
  //   .send({ data: company, message: "Employee created successfully!" });
});
