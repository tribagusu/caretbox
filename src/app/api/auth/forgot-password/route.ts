import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Always return success to avoid revealing whether an account exists
  const user = await prisma.user.findUnique({
    where: { email },
    select: { password: true },
  });

  // Only allow reset for credentials users (users with a password)
  if (!user || !user.password) {
    return NextResponse.json({ success: true });
  }

  const token = await generatePasswordResetToken(email);

  if (process.env.SKIP_EMAIL_VERIFICATION === "true") {
    console.log(`[Password Reset] Token for ${email}: ${token}`);
  } else {
    await sendPasswordResetEmail(email, token);
  }

  return NextResponse.json({ success: true });
}
