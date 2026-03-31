import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, deleteVerificationToken } from "@/lib/tokens";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing verification token" },
      { status: 400 }
    );
  }

  const record = await verifyToken(token);

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { email: record.identifier },
    data: { emailVerified: new Date() },
  });

  await deleteVerificationToken(record.identifier, record.token);

  return NextResponse.json({ success: true });
}
