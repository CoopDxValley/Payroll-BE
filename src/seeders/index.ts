import prisma from "../client";

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

seedPermissions()
  .then(() => {
    console.log("Permissions seeded!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  });
