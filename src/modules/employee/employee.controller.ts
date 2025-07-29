import httpStatus from "http-status";
import catchAsync from "../../utils/catch-async";
import employeeService from "./employee.services";
import { CreateEmployeeInput } from "./employee.type";
import { AuthEmployee } from "../auth/auth.type";
import exclude from "../../utils/exclude";

export const registerEmployee = catchAsync(async (req, res) => {
  const input: CreateEmployeeInput = req.body;
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
});

// export const getEmployees = catchAsync(async (req, res) => {
//   const authEmployee = req.user as AuthEmployee;
//   // const user = req.user as AuthEmployee;
//   console.log("employee", authEmployee);
//   const options = pick(req.query, ["sortBy", "limit", "page"]);
//   const result = await employeeService.queryEmployee(
//     authEmployee.companyId,
//     options
//   );
//   res
//     .status(httpStatus.CREATED)
//     .send({ data: result, message: "Employee retrieved successfully" });
// });

export const getEmployeeById = catchAsync(async (req, res) => {
  const { employeeId } = req.params;

  const result = await employeeService.getEmployeeById(employeeId);

  res
    .status(httpStatus.OK)
    .send({ data: result, message: "Employee retrieved successfully" });
});
