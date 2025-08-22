import { Prisma } from "@prisma/client";
import type { EmployeeForPayroll } from "./payroll.type";
import prisma from "../../client";

async function calculatePayrollForEmployee(args: {
  employee: EmployeeForPayroll;
  companyId: string;
  payrollDefinitionId: string;
}): Promise<any> {
  const { employee, companyId, payrollDefinitionId } = args;

  if (!employee.payrollInfo) {
    throw new Error(`Payroll info does not exist for employee ${employee.id}`);
  }

  if (!employee.gradeHistory || employee.gradeHistory.length === 0) {
    throw new Error(`Grade not found for employee ${employee.id}`);
  }

  if (employee.gradeHistory.length > 1) {
    throw new Error(`Multiple active grades found for employee ${employee.id}`);
  }

  const employeeGrade = employee.gradeHistory[0];

  const [pension, allowances, deductions, taxRules] = await Promise.all([
    prisma.companyPensionRule.findFirst({
      where: { companyId, isActive: true },
      select: { pension: true },
    }),
    prisma.allowance.findMany({
      where: { companyId, gradeId: employeeGrade.gradeId },
      include: { allowanceDefinition: true },
    }),
    prisma.deduction.findMany({
      where: { companyId, gradeId: employeeGrade.gradeId },
      include: { deductionDefinition: true },
    }),
    prisma.companyTaxRule.findMany({
      where: { companyId, isActive: true },
      include: { taxSlab: true },
    }),
  ]);

  // ==== Computation (numbers in memory, strings for Prisma Decimal fields) ====
  let totalAllowance = 0;
  let totalDeduction = 0;
  let totalTaxable = 0;
  let totalExempted = 0;
  let totalAdditionalPay = 0;

  for (const a of allowances) {
    const amount = Number(a.amount);
    totalAllowance += amount;

    if (a.allowanceDefinition.isExempted) {
      totalExempted += Number(a.allowanceDefinition.exemptedAmount ?? 0);
      const start = Number(a.allowanceDefinition.startingAmount ?? 0);
      const exempt = Number(a.allowanceDefinition.exemptedAmount ?? 0);
      totalTaxable += amount > start ? amount - exempt : amount;
    } else {
      totalTaxable += amount;
    }
  }

  for (const p of employee.additionalPays) {
    totalAdditionalPay += Number(p.amount);
  }

  console.log("-----", totalAdditionalPay);

  for (const d of deductions) {
    totalDeduction += Number(d.amount);
  }

  for (const d of employee.additionalDeductions) {
    totalDeduction += Number(d.amount);
  }

  const basicSalary = Number(employee.payrollInfo.basicSalary);
  totalTaxable += basicSalary;

  // Tax
  const slab = taxRules.find(
    (t) =>
      totalTaxable > Number(t.taxSlab.minIncome) &&
      totalTaxable < Number(t.taxSlab.maxIncome)
  );

  console.log("gemechuudududu");
  // console.log(slab);
  const deductibleFee = slab?.taxSlab.deductible ?? 0;
  const taxRate = slab?.taxSlab.rate ?? 0;
  const incomeTax = slab ? totalTaxable * (taxRate / 100) - deductibleFee : 0;

  // console.log(taxRate);
  // console.log(taxRules);
  // Pension
  const employeeRate = pension?.pension?.employeeContribution ?? 0;
  const employerRate = pension?.pension?.employerContribution ?? 0;
  const employeePension = (basicSalary * employeeRate) / 100;
  const employerPension = (basicSalary * employerRate) / 100;

  // console.log("--rate", employeePension);
  // console.log("total deduction", totalDeduction);
  const overallDeduction = totalDeduction + incomeTax + employeePension;
  const grossSalary = basicSalary + totalAllowance + totalAdditionalPay;
  const netSalary =
    totalTaxable - overallDeduction + totalExempted + totalAdditionalPay;

  // Return the exact structure you requested
  return {
    employeeId: employee.id,
    payrollDefinitionId,
    grossSalary: grossSalary.toFixed(2),
    basicSalary: basicSalary.toFixed(2),
    taxableIncome: totalTaxable.toFixed(2),
    incomeTax: incomeTax.toFixed(2),
    totalDeduction: overallDeduction.toFixed(2),
    totalAllowance: totalAllowance.toFixed(2),
    netSalary: netSalary.toFixed(2),
    employeePensionAmount: employeePension.toFixed(2),
    employerPensionAmount: employerPension.toFixed(2),
    status: "CREATED", // Using string instead of enum
  };
}

///////ATTENDANCE BASED SALARY

async function calculatePayrollForEmployeeWithAttendance(args: {
  employee: EmployeeForPayroll;
  companyId: string;
  payrollDefinitionId: string;
  workingHours: number;
  expectedHours: number;
}): Promise<any> {
  const {
    employee,
    companyId,
    payrollDefinitionId,
    workingHours,
    expectedHours,
  } = args;

  if (!employee.payrollInfo) {
    throw new Error(`Payroll info does not exist for employee ${employee.id}`);
  }

  if (!employee.gradeHistory || employee.gradeHistory.length === 0) {
    throw new Error(`Grade not found for employee ${employee.id}`);
  }

  if (employee.gradeHistory.length > 1) {
    throw new Error(`Multiple active grades found for employee ${employee.id}`);
  }

  const employeeGrade = employee.gradeHistory[0];

  const [pension, allowances, deductions, taxRules] = await Promise.all([
    prisma.companyPensionRule.findFirst({
      where: { companyId, isActive: true },
      select: { pension: true },
    }),
    prisma.allowance.findMany({
      where: { companyId, gradeId: employeeGrade.gradeId },
      include: { allowanceDefinition: true },
    }),
    prisma.deduction.findMany({
      where: { companyId, gradeId: employeeGrade.gradeId },
      include: { deductionDefinition: true },
    }),
    prisma.companyTaxRule.findMany({
      where: { companyId, isActive: true },
      include: { taxSlab: true },
    }),
  ]);

  // ==== Computation (numbers in memory, strings for Prisma Decimal fields) ====
  let totalAllowance = 0;
  let totalDeduction = 0;
  let totalTaxable = 0;
  let totalExempted = 0;
  let totalAdditionalPay = 0;

  for (const a of allowances) {
    const amount = Number(a.amount);
    totalAllowance += amount;

    if (a.allowanceDefinition.isExempted) {
      totalExempted += Number(a.allowanceDefinition.exemptedAmount ?? 0);
      const start = Number(a.allowanceDefinition.startingAmount ?? 0);
      const exempt = Number(a.allowanceDefinition.exemptedAmount ?? 0);
      totalTaxable += amount > start ? amount - exempt : amount;
    } else {
      totalTaxable += amount;
    }
  }

  console.log("curentt t", )

  for (const p of employee.additionalPays) {
    totalAdditionalPay += Number(p.amount);
  }

  for (const d of deductions) {
    totalDeduction += Number(d.amount);
  }

  for (const d of employee.additionalDeductions) {
    totalDeduction += Number(d.amount);
  }

  const basicSalary = Number(employee.payrollInfo.basicSalary);

  console.log("total total taxable isfdfdfdfd ", totalTaxable);
  // totalTaxable += basicSalary;
  totalTaxable += (basicSalary * workingHours) / expectedHours;
  // Tax
  console.log("Expecte taxable");
  console.log(basicSalary * workingHours);
  console.log((basicSalary * workingHours) / workingHours);
  const slab = taxRules.find(
    (t) =>
      totalTaxable > Number(t.taxSlab.minIncome) &&
      totalTaxable < Number(t.taxSlab.maxIncome)
  );

  const deductibleFee = slab?.taxSlab.deductible ?? 0;
  const taxRate = slab?.taxSlab.rate ?? 0;
  const incomeTax = slab ? totalTaxable * (taxRate / 100) - deductibleFee : 0;

  // Pension - ATTENDANCE BASED CALCULATION
  const employeeRate = pension?.pension?.employeeContribution ?? 0;
  const employerRate = pension?.pension?.employerContribution ?? 0;

  // Use attendance-adjusted basic salary for pension calculation
  const attendanceAdjustedBasicSalary =
    expectedHours > 0
      ? (basicSalary * workingHours) / expectedHours
      : basicSalary;
  console.log("ddkfkdkddkkkdfk");
  console.log("workinghours", workingHours);
  console.log("expected hours", expectedHours);
  console.log(
    "adjusterd attendance bassic salari",
    attendanceAdjustedBasicSalary
  );
  const employeePension = (basicSalary * employeeRate) / 100;
  const employerPension = (basicSalary * employerRate) / 100;

  const overallDeduction = totalDeduction + incomeTax + employeePension;
  const grossSalary = basicSalary + totalAllowance + totalAdditionalPay;
  const netSalary =
    totalTaxable - overallDeduction + totalExempted + totalAdditionalPay;

  // Return the exact structure you requested
  return {
    employeeId: employee.id,
    payrollDefinitionId,
    grossSalary: grossSalary.toFixed(2),
    basicSalary: basicSalary.toFixed(2),
    taxableIncome: totalTaxable.toFixed(2),
    incomeTax: incomeTax.toFixed(2),
    totalDeduction: overallDeduction.toFixed(2),
    totalAllowance: totalAllowance.toFixed(2),
    netSalary: netSalary.toFixed(2),
    employeePensionAmount: employeePension.toFixed(2),
    employerPensionAmount: employerPension.toFixed(2),

    status: "CREATED",
  };
}

export default {
  calculatePayrollForEmployee,
  calculatePayrollForEmployeeWithAttendance,
};
