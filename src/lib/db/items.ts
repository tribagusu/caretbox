import { prisma } from "@/lib/prisma";

const DEMO_USER_EMAIL = "demo@devstash.io";

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  type: {
    name: string;
    icon: string | null;
    color: string | null;
  };
  tags: { id: string; name: string }[];
}

async function getDemoUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
    select: { id: true },
  });
  return user?.id ?? null;
}

const itemInclude = {
  type: {
    select: { name: true, icon: true, color: true },
  },
  tags: {
    select: { tag: { select: { id: true, name: true } } },
  },
} as const;

function mapItem(
  item: Awaited<ReturnType<typeof prisma.item.findMany<{ include: typeof itemInclude }>>>[number]
): DashboardItem {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    type: item.type,
    tags: item.tags.map((t) => t.tag),
  };
}

export async function getPinnedItems(): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    include: itemInclude,
  });

  return items.map(mapItem);
}

export async function getRecentItems(limit = 10): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(mapItem);
}

export async function getItemStats() {
  const userId = await getDemoUserId();
  if (!userId) return { totalItems: 0, favoriteItems: 0 };

  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}

export interface SidebarItemType {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  count: number;
}

export async function getItemsByType(
  typeName: string
): Promise<DashboardItem[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: {
      userId,
      type: { name: { equals: typeName, mode: "insensitive" } },
    },
    orderBy: { createdAt: "desc" },
    include: itemInclude,
  });

  return items.map(mapItem);
}

export interface ItemDetail {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  contentType: string;
  url: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: {
    name: string;
    icon: string | null;
    color: string | null;
  };
  tags: { id: string; name: string }[];
  collection: { id: string; name: string } | null;
}

export async function getItemById(
  id: string
): Promise<ItemDetail | null> {
  const userId = await getDemoUserId();
  if (!userId) return null;

  const item = await prisma.item.findUnique({
    where: { id, userId },
    include: {
      type: { select: { name: true, icon: true, color: true } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
      collection: { select: { id: true, name: true } },
    },
  });

  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    content: item.content,
    contentType: item.contentType,
    url: item.url,
    language: item.language,
    isFavorite: item.isFavorite,
    isPinned: item.isPinned,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    type: item.type,
    tags: item.tags.map((t) => t.tag),
    collection: item.collection,
  };
}

export async function getSystemItemTypes(): Promise<SidebarItemType[]> {
  const userId = await getDemoUserId();
  if (!userId) return [];

  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
    include: {
      _count: {
        select: { items: { where: { userId } } },
      },
    },
    orderBy: { name: "asc" },
  });

  return itemTypes.map((type) => ({
    id: type.id,
    name: type.name,
    icon: type.icon,
    color: type.color,
    count: type._count.items,
  }));
}
