import { prisma } from "@/lib/prisma";

export interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: Date;
  hasPassword: boolean;
}

export interface ProfileStats {
  totalItems: number;
  totalCollections: number;
  itemsByType: { name: string; icon: string | null; color: string | null; count: number }[];
}

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      password: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.createdAt,
    hasPassword: !!user.password,
  };
}

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [totalItems, totalCollections, itemTypes] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.itemType.findMany({
      where: { isSystem: true },
      include: {
        _count: {
          select: { items: { where: { userId } } },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return {
    totalItems,
    totalCollections,
    itemsByType: itemTypes.map((type) => ({
      name: type.name,
      icon: type.icon,
      color: type.color,
      count: type._count.items,
    })),
  };
}
