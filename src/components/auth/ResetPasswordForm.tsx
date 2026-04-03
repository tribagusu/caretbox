"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <XCircle className="mx-auto h-10 w-10 text-destructive" />
        <p className="text-muted-foreground">Missing reset token.</p>
        <Link
          href="/forgot-password"
          className={buttonVariants({ variant: "outline", className: "w-full" })}
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
        <h2 className="text-xl font-bold text-foreground">Password reset!</h2>
        <p className="text-muted-foreground">
          Your password has been updated. You can now sign in with your new
          password.
        </p>
        <Link href="/sign-in" className={buttonVariants({ className: "w-full" })}>
          Sign in
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setSuccess(true);
    } else {
      const data = await res.json();
      setError(data.error || "Something went wrong. Please try again.");
    }

    setIsLoading(false);
  }

  return (
    <>
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-foreground"
          >
            New password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-foreground"
          >
            Confirm new password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </>
  );
}
