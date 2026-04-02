import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  if (process.env.ENABLE_EMAIL_VERIFICATION === "false") {
    return NextResponse.json({ success: true });
  }

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { emailVerified: true },
  });

  // Don't reveal whether the user exists
  if (!user || user.emailVerified) {
    return NextResponse.json({ success: true });
  }

  const token = await generateVerificationToken(email);
  await sendVerificationEmail(email, token);

  return NextResponse.json({ success: true });
}
