import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const registerSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: Request) {
  const body = await request.json();

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Invalid input";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { name, email, password } = parsed.data;

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
