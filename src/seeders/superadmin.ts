import prisma from "../client";
import { encryptPassword } from "../utils/encryption";

async function main() {
  const superadminUsername = "IT-head";
  const superadminPassword = "SuperSecurePassword123";

  const company = await prisma.company.create({
    data: {
      organizationName: "DIRRE DAWA REGIONAL HEALTH BUREAU",
      phoneNumber: "1234567890",
      companyCode: "DRD-001",
    //   level: "MOHHEAD",
    },
  });

  // 1. Create or find superadmin role
  const superadminRole = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: {},
    create: {
      name: "superAdmin",
      companyId: company.id,
      //   description: "Has all permissions",
    },
  });

  // 2. Fetch all permissions
  // const allPermissions = await prisma.permission.findMany();
  const allPermissions = await prisma.permission.findMany({
    where: {
      subject: {
        in: [
          "dashboard",
          "system_setting",
          "campaign_setup",
          "campaign_reports",
        ],
      },
    },
  });

  // 3. Assign all permissions to superadmin role
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: superadminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superadminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // 4. Create or find superadmin user
  //   const hashedPassword = await bcrypt.hash(superadminPassword, 10);

  const superadminUser = await prisma.employee.upsert({
    where: { username: superadminUsername },
    update: {},
    create: {
      name: "Super Admin",
      password: await encryptPassword(superadminPassword),
      phoneNumber: "0931653136",
      username: superadminUsername,
      companyId: company.id,
      isSuperAdmin: true,
    },
  });

  // 5. Assign superadmin role to superadmin user
  await prisma.employeeRole.upsert({
    where: {
      employeeId_roleId: {
        employeeId: superadminUser.id,
        roleId: superadminRole.id,
      },
    },
    update: {},
    create: {
      employeeId: superadminUser.id,
      roleId: superadminRole.id,
    },
  });

  console.log("✅ Superadmin user and role seeded successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
