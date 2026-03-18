import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

const systemItemTypes = [
  { name: "Snippets", icon: "code", color: "#3b82f6" },
  { name: "Prompts", icon: "sparkles", color: "#a855f7" },
  { name: "Commands", icon: "terminal", color: "#22c55e" },
  { name: "Notes", icon: "file-text", color: "#eab308" },
  { name: "Files", icon: "file", color: "#6366f1" },
  { name: "Images", icon: "image", color: "#ec4899" },
  { name: "Links", icon: "link", color: "#14b8a6" },
];

async function main() {
  console.log("Seeding system item types...");

  for (const type of systemItemTypes) {
    await prisma.itemType.upsert({
      where: { id: type.name.toLowerCase() },
      update: {},
      create: {
        id: type.name.toLowerCase(),
        name: type.name,
        icon: type.icon,
        color: type.color,
        isSystem: true,
      },
    });
  }

  console.log(`Seeded ${systemItemTypes.length} system item types.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
