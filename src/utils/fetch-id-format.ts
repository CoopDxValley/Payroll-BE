import prisma from "../client";

type GenerateEmployeeIdParams = {
  companyId: string;
  departmentCode: string;
};

export async function generateEmployeeIdNumber({
  companyId,
  departmentCode,
}: GenerateEmployeeIdParams): Promise<string> {
  const idFormat = await prisma.idFormat.findFirst({
    where: { companyId, isActive: true },
  });

  if (!idFormat) {
    throw new Error("No active IdFormat found for this company");
  }

  const tokens: Record<string, string> = {};

  if (idFormat.companyCode) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { companyCode: true },
    });
    tokens.companyCode = company?.companyCode?.toUpperCase() ?? "COMP";
  }

  if (idFormat.year) {
    tokens.year = new Date().getFullYear().toString();
  }

  if (idFormat.department) {
    if (!departmentCode) {
      throw new Error("Department code is required by IdFormat");
    }
    tokens.department = departmentCode.toUpperCase();
  }

  const lastEmployee = await prisma.employee.findFirst({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    select: { employeeIdNumber: true },
  });

  let nextNumber = 1;
  if (lastEmployee?.employeeIdNumber) {
    const lastNumMatch = lastEmployee.employeeIdNumber.match(/\d+$/);
    if (lastNumMatch) {
      nextNumber = parseInt(lastNumMatch[0], 10) + 1;
    }
  }

  const paddedNumber = nextNumber
    .toString()
    .padStart(idFormat.digitLength, "0");

  const separator = idFormat.separator === "SLASH" ? "/" : "-";

  const orderTokens = idFormat.order.split(",").map((t) => t.trim());
  const parts = orderTokens.map((token) => tokens[token] ?? "").filter(Boolean);

  parts.push(paddedNumber);

  return parts.join(separator);
}
