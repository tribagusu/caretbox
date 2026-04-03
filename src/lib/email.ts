import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "DevStash <onboarding@resend.dev>",
    to: email,
    subject: "Reset your password - DevStash",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #f5f5f5; margin-bottom: 16px;">Reset your password</h2>
        <p style="color: #a1a1aa; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new password.
        </p>
        <a
          href="${resetUrl}"
          style="display: inline-block; margin: 24px 0; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;"
        >
          Reset Password
        </a>
        <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
          This link expires in 1 hour. If you didn&apos;t request a password reset, you can ignore this email.
        </p>
        <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
          Or copy this link: ${resetUrl}
        </p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "DevStash <onboarding@resend.dev>",
    to: email,
    subject: "Verify your email - DevStash",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #f5f5f5; margin-bottom: 16px;">Welcome to DevStash</h2>
        <p style="color: #a1a1aa; line-height: 1.6;">
          Click the button below to verify your email address and activate your account.
        </p>
        <a
          href="${verifyUrl}"
          style="display: inline-block; margin: 24px 0; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 500;"
        >
          Verify Email
        </a>
        <p style="color: #71717a; font-size: 14px; line-height: 1.6;">
          This link expires in 24 hours. If you didn&apos;t create an account, you can ignore this email.
        </p>
        <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
          Or copy this link: ${verifyUrl}
        </p>
      </div>
    `,
  });
}
