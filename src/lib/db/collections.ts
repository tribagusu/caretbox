import { cache } from "react";
import { prisma } from "@/lib/prisma";

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

interface CollectionItem {
  typeId: string;
  type: { icon: string | null; color: string | null };
}

function computeCollectionMeta(items: CollectionItem[]): {
  typeIcons: string[];
  dominantColor: string | null;
} {
  const typeCounts = new Map<string, { icon: string; color: string | null; count: number }>();

  for (const item of items) {
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

  const typeIcons = [...typeCounts.values()].map((t) => t.icon);

  let dominantColor: string | null = null;
  let maxCount = 0;
  for (const t of typeCounts.values()) {
    if (t.count > maxCount) {
      maxCount = t.count;
      dominantColor = t.color;
    }
  }

  return { typeIcons, dominantColor };
}

// Cached: fetches up to 10 recent collections per request.
// Callers slice the result to their desired limit.
export const getRecentCollections = cache(async function getRecentCollections(userId: string): Promise<DashboardCollection[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      _count: { select: { items: true } },
      items: {
        select: {
          typeId: true,
          type: { select: { icon: true, color: true } },
        },
        take: 50,
      },
    },
  });

  return collections.map((collection) => {
    const { typeIcons, dominantColor } = computeCollectionMeta(collection.items);

    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
      typeIcons,
      dominantColor,
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    };
  });
});

export async function getCollectionStats(userId: string) {
  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({
      where: { userId, isFavorite: true },
    }),
  ]);

  return { totalCollections, favoriteCollections };
}
