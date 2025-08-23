import { Prisma } from "@prisma/client";
import httpStatus from "http-status";
import ApiError from "../../utils/api-error";
import prisma from "../../client";
import { createPayrollInput, employeeForPayrollInclude } from "./payroll.type";
import { calculatePayrollForEmployee } from "./payroll.util";
import payrolldefinitionService from "../payrolldefinition/payrolldefinition.service";

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

const getCurrentMonthPayroll = async (companyId: string) => {
  const currentPayrollDefinition =
    await payrolldefinitionService.getCurrentMonth(companyId);

  if (!currentPayrollDefinition) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Current payroll definition not found"
    );
  }

  const payrolls = await prisma.payroll.findMany({
    where: { payrollDefinitionId: currentPayrollDefinition.id },
  });

  return payrolls;
};

const getPayrollByPayrollDefinitionId = async (payrollDefinitionId: string) => {
  const payrolls = await prisma.payroll.findMany({
    where: { payrollDefinitionId },
  });
  return payrolls;
};

const getNonPayrollEmployee = async (payrollDefinitionId: string) => {
  const payrollDefinition = await prisma.payrollDefinition.findUnique({
    where: { id: payrollDefinitionId },
  });

  if (!payrollDefinition)
    throw new ApiError(httpStatus.NOT_FOUND, "Payroll definition not found");

  const nonPayrollEmployees = await prisma.employee.findMany({
    where: {
      id: {
        notIn: await prisma.payroll
          .findMany({
            where: { payrollDefinitionId },
            select: { employeeId: true },
          })
          .then((payrolls) => payrolls.map((p) => p.employeeId)),
      },
    },
    select: {
      name: true,
      gradeHistory: {
        where: { toDate: null },
      },
      positionHistory: {
        where: { toDate: null },
      },
    },
  });

  return nonPayrollEmployees;
};

const getPayrollSetup = async (companyId: string) => {
  const currentPayrollDefinition =
    await payrolldefinitionService.getCurrentMonth(companyId);

  if (!currentPayrollDefinition) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Current payroll definition not found"
    );
  }

  //TODO: Implement payroll setup retrieval with approval
  const Processedpayroll = await prisma.payroll.findMany({
    where: {
      payrollDefinitionId: currentPayrollDefinition.id,
      status: "PENDING",
    },
  });
  const totalProcessedAmount = Processedpayroll.reduce(
    (acc, curr) => acc + curr.grossSalary.toNumber(),
    0
  );
  const UnprocessedPayroll = await prisma.payroll.findMany({
    where: {
      payrollDefinitionId: currentPayrollDefinition.id,
      status: "CREATED",
    },
  });

  const totalUnprocessedAmount = UnprocessedPayroll.reduce(
    (acc, curr) => acc + curr.grossSalary.toNumber(),
    0
  );

  return {
    processed: {
      count: Processedpayroll.length,
      totalAmount: totalProcessedAmount,
    },
    unprocessed: {
      count: UnprocessedPayroll.length,
      totalAmount: totalUnprocessedAmount,
    },
  };
};

const getPayrollProcess = async (companyId: string, id: string) => {
  const definition = await payrolldefinitionService.getCurrentMonth(companyId);

  if (!definition || definition.id !== id) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Payroll definition not found for the current month"
    );
  }

  const data = await prisma.payroll.findMany({
    where: { payrollDefinitionId: { not: definition.id } },
    select: {
      employee: {
        select: {
          id: true,
          name: true,
          payrollInfo: {
            select: {
              employmentType: true,
              basicSalary: true,
              tinNumber: true,
            },
          },
          gradeHistory: {
            where: { toDate: null },
            select: {
              grade: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return data;
};

const payrollPayment = async (companyId: string) => {
  const currentPayrollDefinition =
    await payrolldefinitionService.getCurrentMonth(companyId);

  if (!currentPayrollDefinition) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Current payroll definition not found"
    );
  }

  const payrollPayments = await prisma.payroll.findMany({
    where: {
      payrollDefinitionId: currentPayrollDefinition.id,
    },
    select: {
      totalAllowance: true,
      totalDeduction: true,
      taxableIncome: true,
      grossSalary: true,
      netSalary: true,
      employee: {
        select: {
          id: true,
          name: true,
          payrollInfo: {
            select: {
              basicSalary: true,
              employmentType: true,
              tinNumber: true,
            },
          },
          gradeHistory: {
            where: { toDate: null },
            select: {
              grade: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return payrollPayments;
};

export default {
  createPayroll,
  getCurrentMonthPayroll,
  getPayrollByPayrollDefinitionId,
  getNonPayrollEmployee,
  getPayrollSetup,
  getPayrollProcess,
  payrollPayment,
};
