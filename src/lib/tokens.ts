import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_HOURS = 24;
const PASSWORD_RESET_EXPIRY_HOURS = 1;
const PASSWORD_RESET_PREFIX = "pwd-reset:";

export async function generateVerificationToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyToken(token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!record) return null;
  if (record.expires < new Date()) return null;

  return record;
}

export async function deleteVerificationToken(identifier: string, token: string) {
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });
}

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + PASSWORD_RESET_EXPIRY_HOURS * 60 * 60 * 1000);
  const identifier = PASSWORD_RESET_PREFIX + email;

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

export async function verifyPasswordResetToken(token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: {
      token,
      identifier: { startsWith: PASSWORD_RESET_PREFIX },
    },
  });

  if (!record) return null;
  if (record.expires < new Date()) return null;

  return {
    email: record.identifier.replace(PASSWORD_RESET_PREFIX, ""),
    identifier: record.identifier,
    token: record.token,
  };
}

export async function deletePasswordResetToken(identifier: string, token: string) {
  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier, token } },
  });
}
