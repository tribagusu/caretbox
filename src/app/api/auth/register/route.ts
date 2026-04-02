import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, confirmPassword } = body;

  if (!name || !email || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const emailVerificationEnabled =
    process.env.ENABLE_EMAIL_VERIFICATION !== "false";

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ...(emailVerificationEnabled ? {} : { emailVerified: new Date() }),
    },
  });

  if (emailVerificationEnabled) {
    const token = await generateVerificationToken(email);
    await sendVerificationEmail(email, token);
  }

  return NextResponse.json(
    {
      success: true,
      message: emailVerificationEnabled
        ? "Verification email sent. Please check your inbox."
        : "Account created successfully.",
      requiresVerification: emailVerificationEnabled,
    },
    { status: 201 }
  );
}
