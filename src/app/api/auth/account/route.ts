import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // All relations to User have onDelete: Cascade in the schema,
  // so deleting the user cascades to items, collections, tags, accounts, sessions, etc.
  // ItemTag cascades via Item (onDelete: Cascade) and Tag (onDelete: Cascade).
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
