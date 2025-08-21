// prisma/seed.ts
import { Gender, PrismaClient, ProvidentFundType } from "@prisma/client";
import config from "../src/config/config";
import { generateRandomPassword } from "../src/utils/helper";
import { encryptPassword } from "../src/utils/encryption";

const prisma = new PrismaClient();

const subjects = [
  "dashboard",
  "system_setting",
  "program_setup",
  "program_process",
  "program_payment",
  "program_approval",
  "unprocessed_program",
  "employee",
  "shift",
  "biometric_data",
  "attendance_sheet",
  "attendance_summary",
  "leave_request",
  "leave_approval",
  "payroll_setup",
  "payroll_process",
  "payroll_published",
  "payroll_payment",
  "payroll_approval",
  "unprocessed_payroll",
  "payroll_published_reports",
  "payslip",
  "loan",
  "coopai",
];
const actions = ["create", "view", "update", "delete"];

async function seedPermissions() {
  for (const subject of subjects) {
    for (const action of actions) {
      const action_subject = `${action}_${subject}`;

      await prisma.permission.upsert({
        where: { action_subject },
        update: {},
        create: {
          action,
          subject,
          action_subject,
        },
      });
    }
  }
}

async function seedCompany() {
  return prisma.company.create({
    data: {
      organizationName: "Acme Corp",
      phoneNumber: "123456789",
      companyCode: "ACME001",
      email: "info@acme.com",
      notes: "Main company seeding",
    },
  });
}

async function seedRoles(companyId: string, permissions: any[]) {
  const adminRole = await prisma.role.create({
    data: {
      name: "Admin",
      companyId,
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      name: "Manager",
      companyId,
    },
  });

  const finance = await prisma.role.create({
    data: {
      name: "Finance",
      companyId,
    },
  });

  await prisma.rolePermission.createMany({
    data: permissions.map((p) => ({
      roleId: adminRole.id,
      permissionId: p.id,
    })),
    skipDuplicates: true,
  });

  return adminRole;
}

async function seedDepartmentAndPosition(companyId: string) {
  const department = await prisma.department.create({
    data: {
      deptName: "Engineering",
      location: "HQ",
      shorthandRepresentation: "ENG",
      companyId,
    },
  });

  const position = await prisma.position.create({
    data: {
      positionName: "Software Engineer",
      description: "Builds software",
      companyId,
    },
  });

  return { department, position };
}

async function seedEmployee(
  companyId: string,
  departmentId: string,
  positionId: string,
  roleId: string
) {
  const employeeData = [
    {
      name: "Alice Tesfa",
      username: "alice",
      phoneNumber: "0911111111",
      gender: Gender.FEMALE,
    },
    {
      name: "Biruk Alemu",
      username: "biruk",
      phoneNumber: "0922222222",
      gender: Gender.FEMALE,
    },
    {
      name: "Chaltu Diba",
      username: "chaltu",
      phoneNumber: "0933333333",
      gender: Gender.FEMALE,
    },
    {
      name: "Dawit Bekele",
      username: "dawit",
      phoneNumber: "0944444444",
      gender: Gender.FEMALE,
    },
    {
      name: "Elshaday Mulu",
      username: "elshaday",
      phoneNumber: "0955555555",
      gender: Gender.FEMALE,
    },
  ];
  const rawPassword =
    config.env === "development"
      ? "SuperSecurePassword@123"
      : generateRandomPassword();
  const hashedPassword = await encryptPassword(rawPassword);
  for (const emp of employeeData) {
    const employee = await prisma.employee.create({
      data: {
        name: emp.name,
        username: emp.username,
        phoneNumber: emp.phoneNumber,
        password: hashedPassword,
        companyId,
        gender: emp.gender,
        // departmentId,
        // positionId,
      },
    });

    await prisma.employeeRoleHistory.create({
      data: {
        employeeId: employee.id,
        roleId,
        fromDate: new Date(),
      },
    });
  }

  console.log(`✅ Seeded ${employeeData.length} employees`);
}

async function seedGrade(companyId: string) {
  await prisma.grade.create({
    data: {
      name: "Grade A",
      minSalary: 5000,
      maxSalary: 10000,
      companyId,
    },
  });
}

async function getPermissions() {
  return prisma.permission.findMany();
}

async function seedDefaultTaxslabProvidentFund() {
  // Default Ethiopian Tax Slabs (Income Tax and Exemptions)
  const defaultTaxSlabs = [
    {
      name: "Income Tax 0%",
      description: "Tax-free income up to 600 ETB",
      rate: 0,
      deductible: 0,
      minIncome: 0,
      maxIncome: 600,
      incomeTaxPayable: 0,
      isDefault: true,
    },
    {
      name: "Income Tax 10%",
      description: "Income tax for 601–1,650 ETB",
      rate: 10,
      deductible: 60,
      minIncome: 601,
      maxIncome: 1650,
      incomeTaxPayable: 10,
      isDefault: true,
    },
    {
      name: "Income Tax 15%",
      description: "Income tax for 1,651–3,200 ETB",
      rate: 15,
      deductible: 142.5,
      minIncome: 1651,
      maxIncome: 3200,
      incomeTaxPayable: 15,
      isDefault: true,
    },
    {
      name: "Income Tax 20%",
      description: "Income tax for 3,201–5,250 ETB",
      rate: 20,
      deductible: 302.5,
      minIncome: 3201,
      maxIncome: 5250,
      incomeTaxPayable: 20,
      isDefault: true,
    },
    {
      name: "Income Tax 25%",
      description: "Income tax for 5,251–7,800 ETB",
      rate: 25,
      deductible: 565,
      minIncome: 5251,
      maxIncome: 7800,
      incomeTaxPayable: 25,
      isDefault: true,
    },
    {
      name: "Income Tax 30%",
      description: "Income tax for 7,801–10,900 ETB",
      rate: 30,
      deductible: 955,
      minIncome: 7801,
      maxIncome: 10900,
      incomeTaxPayable: 30,
      isDefault: true,
    },
    {
      name: "Income Tax 35%",
      description: "Income tax for over 10,900 ETB",
      rate: 35,
      deductible: 1500,
      minIncome: 10901,
      maxIncome: 2000000, // Arbitrary high max for practical purposes
      incomeTaxPayable: 35,
      isDefault: true,
    },
  ];

  // Default Ethiopian Social Security (Provident Fund)
  const defaultProvidentFund = [
    {
      employerContribution: 11,
      employeeContribution: 4,
      isDefault: true,
    },
  ];

  const defaultPension = [
    {
      employerContribution: 11,
      employeeContribution: 4,
      isDefault: true,
    },
  ];

  // Seed TaxSlabs
  for (const slab of defaultTaxSlabs) {
    await prisma.taxSlab.create({
      // where: { id: slab.id },
      // update: {},
      data: slab,
    });
  }

  for (const ss of defaultProvidentFund) {
    await prisma.providentFund.create({
      data: ss,
    });
  }

  for (const ss of defaultPension) {
    await prisma.pension.create({
      data: ss,
    });
  }

  console.log(
    "Default tax slabs, pensions, and provident fund rules seeded successfully."
  );
}

async function main() {
  await seedPermissions();
  const permissions = await getPermissions();
  const company = await seedCompany();
  const role = await seedRoles(company.id, permissions);
  const { department, position } = await seedDepartmentAndPosition(company.id);
  await seedEmployee(company.id, department.id, position.id, role.id);
  await seedGrade(company.id);
  await seedDefaultTaxslabProvidentFund();

  console.log("🌱 Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
