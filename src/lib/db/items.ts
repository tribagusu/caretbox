import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { deleteFromR2 } from "@/lib/r2";

export interface DashboardItem {
  id: string;
  title: string;
  description: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  type: {
    name: string;
    icon: string | null;
    color: string | null;
  };
  tags: { id: string; name: string }[];
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    createdAt: item.createdAt,
    type: item.type,
    tags: item.tags.map((t) => t.tag),
  };
}

export async function getPinnedItems(userId: string, limit = 20): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(mapItem);
}

export async function getRecentItems(userId: string, limit = 10): Promise<DashboardItem[]> {
  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: itemInclude,
  });

  return items.map(mapItem);
}

export async function getItemStats(userId: string) {
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
  userId: string,
  typeName: string
): Promise<DashboardItem[]> {
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
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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
  userId: string,
  id: string
): Promise<ItemDetail | null> {
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
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
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

export interface UpdateItemData {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
}

export async function updateItem(
  userId: string,
  id: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const item = await prisma.item.findUnique({
    where: { id, userId },
    select: { id: true },
  });

  if (!item) return null;

  const updated = await prisma.item.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: {
                name_userId: { name: tagName, userId },
              },
              create: { name: tagName, userId },
            },
          },
        })),
      },
    },
    include: {
      type: { select: { name: true, icon: true, color: true } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
      collection: { select: { id: true, name: true } },
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    description: updated.description,
    content: updated.content,
    contentType: updated.contentType,
    fileUrl: updated.fileUrl,
    fileName: updated.fileName,
    fileSize: updated.fileSize,
    url: updated.url,
    language: updated.language,
    isFavorite: updated.isFavorite,
    isPinned: updated.isPinned,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
    type: updated.type,
    tags: updated.tags.map((t) => t.tag),
    collection: updated.collection,
  };
}

export interface CreateItemData {
  title: string;
  description: string | null;
  content: string | null;
  contentType: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  url: string | null;
  language: string | null;
  typeId: string;
  tags: string[];
}

export async function createItem(
  userId: string,
  data: CreateItemData
): Promise<ItemDetail> {
  const typeExists = await prisma.itemType.findFirst({
    where: { id: data.typeId, OR: [{ isSystem: true }, { userId }] },
    select: { id: true },
  });

  if (!typeExists) {
    throw new Error("Invalid item type");
  }

  const created = await prisma.item.create({
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      contentType: data.contentType,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      url: data.url,
      language: data.language,
      userId,
      typeId: data.typeId,
      tags: {
        create: data.tags.map((tagName) => ({
          tag: {
            connectOrCreate: {
              where: { name_userId: { name: tagName, userId } },
              create: { name: tagName, userId },
            },
          },
        })),
      },
    },
    include: {
      type: { select: { name: true, icon: true, color: true } },
      tags: { select: { tag: { select: { id: true, name: true } } } },
      collection: { select: { id: true, name: true } },
    },
  });

  return {
    id: created.id,
    title: created.title,
    description: created.description,
    content: created.content,
    contentType: created.contentType,
    fileUrl: created.fileUrl,
    fileName: created.fileName,
    fileSize: created.fileSize,
    url: created.url,
    language: created.language,
    isFavorite: created.isFavorite,
    isPinned: created.isPinned,
    createdAt: created.createdAt,
    updatedAt: created.updatedAt,
    type: created.type,
    tags: created.tags.map((t) => t.tag),
    collection: created.collection,
  };
}

export async function deleteItem(userId: string, id: string): Promise<boolean> {
  const item = await prisma.item.findUnique({
    where: { id, userId },
    select: { id: true, fileUrl: true },
  });

  if (!item) return false;

  await prisma.item.delete({ where: { id } });

  if (item.fileUrl) {
    try {
      await deleteFromR2(item.fileUrl);
    } catch {
      // Log but don't fail — orphaned R2 objects are harmless
      console.error(`Failed to delete R2 object: ${item.fileUrl}`);
    }
  }

  return true;
}

export const getSystemItemTypes = cache(async function getSystemItemTypes(userId: string): Promise<SidebarItemType[]> {
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
});
