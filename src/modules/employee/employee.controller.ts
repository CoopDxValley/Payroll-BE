import { Response } from "express";
import httpStatus from "http-status";
import ExcelJS from "exceljs";
import catchAsync from "../../utils/catch-async";
import employeeService from "./employee.services";
import {
  AssignEmployeeToDepartmentBody,
  AssignEmployeeToPositionBody,
  CreateEmployeeInput,
  EmployeeSearchQuery,
  GeneratePasswordInput,
  GetEmployeeInfoByIdParams,
  getEmployeesQuery,
} from "./employee.type";
import { AuthEmployee } from "../auth/auth.type";
import exclude from "../../utils/exclude";
import pick from "../../utils/pick";
import { CustomRequest } from "../../middlewares/validate";
import ApiError from "../../utils/api-error";
import departmentService from "../department/department.service";
import positionService from "../position/position.service";
import gradeService from "../grades/grade.service";
import { EmploymentType, Gender, IdType, MaritalStatus } from "@prisma/client";

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

export const generatePassword = catchAsync<
  CustomRequest<never, never, GeneratePasswordInput>
>(
  async (
    req: CustomRequest<never, never, GeneratePasswordInput>,
    res: Response
  ) => {
    const { email, employeeId } = req.body;

    await employeeService.generatePassword({
      email,
      employeeId,
    });

    res.status(httpStatus.OK).send({
      data: [],
      message: "Password generated successfully",
    });
  }
);

export const searchEmployees = catchAsync<
  CustomRequest<never, EmployeeSearchQuery, never>
>(
  async (
    req: CustomRequest<never, EmployeeSearchQuery, never>,
    res: Response
  ) => {
    const input = req.validatedQuery;

    if (!input)
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid query parameters");

    const result = await employeeService.searchEmployees({
      keyword: input.keyword,
      page: input?.page,
      limit: input?.limit,
    });

    res.status(httpStatus.OK).send({
      data: result,
      message: "Employees retrieved successfully",
    });
  }
);

export const employeeHistory = catchAsync<CustomRequest<never, never, never>>(
  async (req, res) => {
    const authEmployee = req.employee as AuthEmployee;
    const history = await employeeService.getEmployeeHistory(authEmployee.id);

    res.status(httpStatus.OK).send({
      message: "Employee History retrieved successfully",
      data: history,
    });
  }
);

export const downloadEmployeeSheets = catchAsync<
  CustomRequest<never, never, never>
>(async (req, res: Response) => {
  const authEmployee = req.employee as AuthEmployee;

  // Fetch all reference data in parallel
  const [departments, positions, grades] = await Promise.all([
    departmentService.getAllDepartments(authEmployee.companyId),
    positionService.getAllPositions(authEmployee.companyId),
    gradeService.getAllGrades(authEmployee.companyId),
  ]);

  const workbook = new ExcelJS.Workbook();

  /** ---------------- Instructions Sheet ---------------- */
  const instructionsSheet = workbook.addWorksheet("Instructions");
  instructionsSheet.columns = [
    { header: "Instructions", key: "instructions", width: 150 },
  ];
  const instrHeader = instructionsSheet.getRow(1);
  instrHeader.font = { bold: true, size: 20, color: { argb: "FFFFFF" } };
  instrHeader.alignment = { horizontal: "center" };
  instrHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0070C0" },
  };

  [
    "1. Please refer to the 'Grades' sheet to view grade salary ranges.",
    "2. Ensure salaries fall within the grade min/max.",
    "3. Use dropdowns for 'Gender', 'Marital Status', etc.",
    "4. Dates must be 'yyyy-mm-dd'.",
    "5. Email, Account Number, Phone Number must be unique.",
  ].forEach((txt) => {
    const row = instructionsSheet.addRow({ instructions: txt });
    row.font = { bold: true, size: 12 };
  });

  /** ---------------- Reference Sheets ---------------- */
  const departmentSheet = workbook.addWorksheet("Departments");
  departmentSheet.columns = [
    { header: "Department ID", key: "id", width: 15 },
    { header: "Department Name", key: "deptName", width: 30 },
  ];
  departments.forEach((d) =>
    departmentSheet.addRow({ id: d.id, deptName: d.deptName })
  );

  const positionSheet = workbook.addWorksheet("Positions");
  positionSheet.columns = [
    { header: "Position ID", key: "id", width: 15 },
    { header: "Position Name", key: "name", width: 30 },
  ];
  positions.forEach((p) =>
    positionSheet.addRow({ id: p.id, name: p.positionName })
  );

  const gradeSheet = workbook.addWorksheet("Grades");
  gradeSheet.columns = [
    { header: "Grade Name", key: "name", width: 20 },
    { header: "Min Salary", key: "minSalary", width: 20 },
    { header: "Max Salary", key: "maxSalary", width: 20 },
  ];
  gradeSheet.getRow(1).eachCell((c) => {
    c.font = { bold: true, color: { argb: "FFFFFF" }, size: 13 };
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    c.alignment = { vertical: "middle", horizontal: "center" };
  });
  grades.forEach((g) =>
    gradeSheet.addRow({
      name: g.name,
      minSalary: g.minSalary,
      maxSalary: g.maxSalary,
    })
  );

  /** ---------------- Employees Sheet ---------------- */
  const employeeSheet = workbook.addWorksheet("Employees");
  employeeSheet.columns = [
    { header: "FULL NAME", key: "name", width: 30 },
    { header: "GENDER", key: "gender", width: 20 },
    { header: "DATE OF BIRTH", key: "dateOfBirth", width: 20 },
    { header: "PHONE NUMBER", key: "phoneNumber", width: 25 },
    { header: "EMPLOYEE ID", key: "deviceUserId", width: 25 },
    { header: "NATIONALITY", key: "nationality", width: 25 },
    { header: "ID NUMBER", key: "idNumber", width: 25 },
    { header: "ID TYPE", key: "idType", width: 20 },
    { header: "DEPARTMENT", key: "departmentId", width: 25 },
    { header: "GRADE", key: "gradeId", width: 20 },
    { header: "MARRIAGE STATUS", key: "marriageStatus", width: 25 },
    { header: "EMPLOYEE TIN", key: "tinNumber", width: 25 },
    { header: "BASIC SALARY", key: "basicSalary", width: 20 },
    { header: "EMPLOYMENT TYPE", key: "employmentType", width: 25 },
    { header: "HIRE DATE", key: "hireDate", width: 20 },
    { header: "POSITION", key: "positionId", width: 25 },
    { header: "ACCOUNT NUMBER", key: "accountNumber", width: 30 },
    { header: "EMERGENCY RELATION", key: "relationship", width: 25 },
    { header: "EMERGENCY PHONE", key: "phone", width: 25 },
    { header: "EMERGENCY FULL NAME", key: "fullName", width: 30 },
  ];

  /** ---------------- Dropdown Reference Sheets ---------------- */
  const SEX_LIST: Gender[] = ["MALE", "FEMALE"];
  const MARITALSTATUS: MaritalStatus[] = [
    "SINGLE",
    "MARRIED",
    "DIVORCED",
    "WIDOWED",
  ];
  const IDTYPE: IdType[] = ["KEBELE", "PASSPORT", "LICENSE", "NATIONALID"];
  const EmploymentTypes = Object.values(EmploymentType);

  const sexSheet = workbook.addWorksheet("SexOptions");
  SEX_LIST.forEach((v, i) => (sexSheet.getCell(`A${i + 1}`).value = v));

  const maritalSheet = workbook.addWorksheet("MaritalOptions");
  MARITALSTATUS.forEach(
    (v, i) => (maritalSheet.getCell(`A${i + 1}`).value = v)
  );

  const idTypeSheet = workbook.addWorksheet("IdTypeOptions");
  IDTYPE.forEach((v, i) => (idTypeSheet.getCell(`A${i + 1}`).value = v));

  const empTypeSheet = workbook.addWorksheet("EmpTypeOptions");
  EmploymentTypes.forEach(
    (v, i) => (empTypeSheet.getCell(`A${i + 1}`).value = v)
  );

  // Hide reference sheets
  [
    sexSheet,
    maritalSheet,
    idTypeSheet,
    empTypeSheet,
    departmentSheet,
    positionSheet,
  ].forEach((s) => (s.state = "veryHidden"));

  /** ---------------- Header Formatting ---------------- */
  employeeSheet.getRow(1).eachCell((c) => {
    c.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0070C0" },
    };
    c.font = { color: { argb: "FFFFFF" }, bold: true, size: 13 };
  });

  /** ---------------- Apply Validations ---------------- */
  (employeeSheet as any).dataValidations.add("B2:B1000", {
    type: "list",
    formulae: [`SexOptions!$A$1:$A$${SEX_LIST.length}`],
  });
  (employeeSheet as any).dataValidations.add("K2:K1000", {
    type: "list",
    formulae: [`MaritalOptions!$A$1:$A$${MARITALSTATUS.length}`],
  });
  (employeeSheet as any).dataValidations.add("H2:H1000", {
    type: "list",
    formulae: [`IdTypeOptions!$A$1:$A$${IDTYPE.length}`],
  });
  (employeeSheet as any).dataValidations.add("N2:N1000", {
    type: "list",
    formulae: [`EmpTypeOptions!$A$1:$A$${EmploymentTypes.length}`],
  });

  // Department, Grade, Position now use hidden sheets for safety
  (employeeSheet as any).dataValidations.add("I2:I1000", {
    type: "list",
    formulae: [`Departments!$B$2:$B$${departments.length + 1}`],
  });
  (employeeSheet as any).dataValidations.add("J2:J1000", {
    type: "list",
    formulae: [`Grades!$A$2:$A$${grades.length + 1}`],
  });
  (employeeSheet as any).dataValidations.add("P2:P1000", {
    type: "list",
    formulae: [`Positions!$B$2:$B$${positions.length + 1}`],
  });

  // Dates
  ["C", "O"].forEach((col) => {
    employeeSheet.getColumn(col).eachCell({ includeEmpty: true }, (cell, r) => {
      if (r === 1) return;
      cell.numFmt = "yyyy-mm-dd";
      (cell as any).dataValidation = {
        type: "date",
        operator: "greaterThan",
        formula1: "DATE(1900,1,1)",
      };
    });
  });

  /** ---------------- Response ---------------- */
  const buffer = await workbook.xlsx.writeBuffer();
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=employee_template.xlsx"
  );
  res.status(httpStatus.OK).send(Buffer.from(buffer));
});
