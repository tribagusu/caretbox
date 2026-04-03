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

  const skipEmailVerification =
    process.env.SKIP_EMAIL_VERIFICATION === "true";

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ...(skipEmailVerification ? { emailVerified: new Date() } : {}),
    },
  });

  if (skipEmailVerification) {
    return NextResponse.json(
      { success: true, message: "Account created successfully.", requiresVerification: false },
      { status: 201 }
    );
  }

  const token = await generateVerificationToken(email);
  await sendVerificationEmail(email, token);

  return NextResponse.json(
    { success: true, message: "Verification email sent. Please check your inbox.", requiresVerification: true },
    { status: 201 }
  );
}
