"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // Always show success to avoid revealing whether the email exists
    setSent(true);
    setIsLoading(false);
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
        <p className="text-sm text-muted-foreground">
          If an account exists with that email, we&apos;ve sent a password reset
          link. Please check your inbox.
        </p>
        <Link
          href="/sign-in"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-foreground"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/sign-in"
          className="font-medium text-primary hover:underline"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
