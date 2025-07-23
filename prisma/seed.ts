// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import config from "../src/config/config";
import { generateRandomPassword } from "../src/utils/helper";
import { encryptPassword } from "../src/utils/encryption";

const prisma = new PrismaClient();

const subjects = [
  "dashboard",
  "system_setting",
  "campaign_setup",
  "participants",
  "campaign_process",
  "campaign_approval",
  "campaign_payment",
  "unprocessed_campaign",
  "campaign_published",
  "campaign_reports",
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
  })

  const finance = await prisma.role.create({
    data: {
      name: "Finance",
      companyId,
    },
  })

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
    { name: "Alice Tesfa", username: "alice", phoneNumber: "0911111111" },
    { name: "Biruk Alemu", username: "biruk", phoneNumber: "0922222222" },
    { name: "Chaltu Diba", username: "chaltu", phoneNumber: "0933333333" },
    { name: "Dawit Bekele", username: "dawit", phoneNumber: "0944444444" },
    {
      name: "Elshaday Mulu",
      username: "elshaday",
      phoneNumber: "0955555555",
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
        departmentId,
        positionId,
      },
    });

    await prisma.employeeRole.create({
      data: {
        employeeId: employee.id,
        roleId,
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

async function main() {
  await seedPermissions();
  const permissions = await getPermissions();
  const company = await seedCompany();
  const role = await seedRoles(company.id, permissions);
  const { department, position } = await seedDepartmentAndPosition(company.id);
  await seedEmployee(company.id, department.id, position.id, role.id);
  await seedGrade(company.id);

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
