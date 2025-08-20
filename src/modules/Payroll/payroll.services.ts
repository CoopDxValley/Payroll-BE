import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import prisma from "../../client";
import { createPayrollInput, employeeForPayrollInclude } from "./payroll.type";
import { calculatePayrollForEmployee } from "./payroll.util";

export const createPayroll = async (
  data: createPayrollInput & { companyId: string }
) => {
  const def = await prisma.payrollDefinition.findUnique({
    where: { id: data.payrollDefinitionId, companyId: data.companyId },
  });
  if (!def)
    throw new ApiError(httpStatus.BAD_REQUEST, "Payroll definition not found");

  const employees = await prisma.employee.findMany({
    where: { companyId: data.companyId, id: { in: data.employeeIds } },
    include: employeeForPayrollInclude,
  });

  if (employees.length !== data.employeeIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "One or more employees not found"
    );
  }

  const existing = await prisma.payroll.findMany({
    where: {
      employeeId: { in: data.employeeIds },
      payrollDefinitionId: data.payrollDefinitionId,
    },
  });
  if (existing.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payroll already exists for one or more employees"
    );
  }

  const rows: Prisma.PayrollCreateManyInput[] = [];
  for (const emp of employees) {
    rows.push(
      await calculatePayrollForEmployee({
        employee: emp,
        companyId: data.companyId,
        payrollDefinitionId: def.id,
      })
    );
  }

  const createdPayroll = await prisma.payroll.createMany({ data: rows });
  return createdPayroll;
};

export default { createPayroll };
