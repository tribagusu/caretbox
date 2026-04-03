import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPasswordResetToken, deletePasswordResetToken } from "@/lib/tokens";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json(
      { error: "Token and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const record = await verifyPasswordResetToken(token);

  if (!record) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { email: record.email },
    data: { password: hashedPassword },
  });

  await deletePasswordResetToken(record.identifier, record.token);

  return NextResponse.json({ success: true });
}
