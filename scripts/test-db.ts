import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env["DATABASE_URL"]!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Testing database connection...\n");

  // 1. System item types
  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  console.log(`System Item Types (${itemTypes.length}):`);
  for (const type of itemTypes) {
    console.log(`  - ${type.name} (${type.icon}, ${type.color})`);
  }

  // 2. Demo user
  const user = await prisma.user.findUnique({
    where: { email: "demo@devstash.io" },
    select: {
      id: true,
      name: true,
      email: true,
      isPro: true,
      emailVerified: true,
      password: true,
    },
  });

  if (!user) {
    console.log("\n✗ Demo user not found!");
    return;
  }

  console.log(`\nDemo User:`);
  console.log(`  Name:          ${user.name}`);
  console.log(`  Email:         ${user.email}`);
  console.log(`  Pro:           ${user.isPro}`);
  console.log(`  Verified:      ${user.emailVerified ? "Yes" : "No"}`);
  console.log(`  Has password:  ${user.password ? "Yes" : "No"}`);

  // 3. Collections with item counts
  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });

  console.log(`\nCollections (${collections.length}):`);
  for (const col of collections) {
    const fav = col.isFavorite ? " ★" : "";
    console.log(`  - ${col.name} (${col._count.items} items)${fav}`);
    if (col.description) console.log(`    ${col.description}`);
  }

  // 4. Items grouped by type
  const items = await prisma.item.findMany({
    where: { userId: user.id },
    include: {
      type: true,
      collection: { select: { name: true } },
      tags: { include: { tag: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  console.log(`\nItems (${items.length}):`);
  const grouped = new Map<string, typeof items>();
  for (const item of items) {
    const typeName = item.type.name;
    if (!grouped.has(typeName)) grouped.set(typeName, []);
    grouped.get(typeName)!.push(item);
  }

  for (const [typeName, typeItems] of grouped) {
    console.log(`\n  [${typeName}] (${typeItems.length})`);
    for (const item of typeItems) {
      const flags = [
        item.isFavorite ? "★" : "",
        item.isPinned ? "📌" : "",
      ].filter(Boolean).join(" ");
      const tagList = item.tags.map((t) => t.tag.name).join(", ");
      const collection = item.collection ? ` → ${item.collection.name}` : "";
      console.log(`    - ${item.title}${collection} ${flags}`);
      if (item.url) console.log(`      URL: ${item.url}`);
      if (tagList) console.log(`      Tags: ${tagList}`);
    }
  }

  // 5. Tags
  const tags = await prisma.tag.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { name: "asc" },
  });

  console.log(`\nTags (${tags.length}):`);
  const tagLine = tags.map((t) => `${t.name}(${t._count.items})`).join(", ");
  console.log(`  ${tagLine}`);

  // 6. Summary
  console.log("\n─────────────────────────────────");
  console.log(`  ${itemTypes.length} types, ${collections.length} collections, ${items.length} items, ${tags.length} tags`);
  console.log("─────────────────────────────────");
  console.log("\n✓ Database connection successful!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Database connection failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
