import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

export interface DashboardCollection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  typeIcons: string[];
  dominantColor: string | null;
  createdAt: Date;
  updatedAt: Date;
}

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function getRecentCollections(
  limit = 6
): Promise<DashboardCollection[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: {
      items: {
        include: {
          type: true,
        },
      },
    },
  });

  return collections.map((collection) => {
    const typeCounts = new Map<string, { icon: string; color: string | null; count: number }>();

    for (const item of collection.items) {
      const existing = typeCounts.get(item.typeId);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(item.typeId, {
          icon: (item.type.icon ?? "file").toLowerCase(),
          color: item.type.color ?? null,
          count: 1,
        });
      }
    }

    // Get unique type icons
    const typeIcons = [...typeCounts.values()].map((t) => t.icon);

    // Dominant color = color of the most-used content type
    let dominantColor: string | null = null;
    let maxCount = 0;
    for (const t of typeCounts.values()) {
      if (t.count > maxCount) {
        maxCount = t.count;
        dominantColor = t.color;
      }
    }

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection.items.length,
      typeIcons,
      dominantColor,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  });
}

export async function getCollectionStats() {
  const userId = await getDemoUserId();
  if (!userId) return { totalCollections: 0, favoriteCollections: 0 };

  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({
      where: { userId, isFavorite: true },
    }),
  ]);

  return { totalCollections, favoriteCollections };
}
