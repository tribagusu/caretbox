import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

const KEEP_EMAIL = "demo@devstash.io";

async function main() {
  const users = await prisma.user.findMany({
    where: { email: { not: KEEP_EMAIL } },
    select: { id: true, email: true },
  });

  if (users.length === 0) {
    console.log("No users to delete (only demo user exists).");
    return;
  }

  console.log(`Deleting ${users.length} user(s):`);
  for (const u of users) {
    console.log(`  - ${u.email ?? "(no email)"} (${u.id})`);
  }

  // Cascade deletes handle items, collections, tags, accounts, sessions
  const result = await prisma.user.deleteMany({
    where: { email: { not: KEEP_EMAIL } },
  });

  console.log(`Deleted ${result.count} user(s) and all their content.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
