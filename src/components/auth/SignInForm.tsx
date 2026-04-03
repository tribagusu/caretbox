"use client";

import { useState, useEffect, useRef } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github } from "lucide-react";
import Link from "next/link";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const error = searchParams.get("error");
  const registered = searchParams.get("registered");
  const unverifiedEmail = searchParams.get("email");
  const toastShown = useRef(false);

  useEffect(() => {
    if (registered && !toastShown.current) {
      toastShown.current = true;
      toast.success(
        "Account created! Please check your email to verify your account."
      );
    }
  }, [registered]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(
    error === "EmailNotVerified"
  );
  const [verificationEmail, setVerificationEmail] = useState(
    unverifiedEmail || ""
  );

  async function handleResendVerification() {
    const targetEmail = verificationEmail || email;
    if (!targetEmail) return;

    setIsResending(true);
    await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    setIsResending(false);
    toast.success("Verification email sent! Please check your inbox.");
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    if (result?.error) {
      setFormError("Invalid email or password");
      setIsLoading(false);
    } else if (result?.url) {
      // NextAuth redirects via URL when signIn callback returns a string
      const url = new URL(result.url);
      if (url.searchParams.get("error") === "EmailNotVerified") {
        setShowVerificationMessage(true);
        setVerificationEmail(email);
        setFormError("");
        setIsLoading(false);
        return;
      }
      window.location.href = result.url;
    }
  }

  return (
    <>
      {showVerificationMessage && (
        <div className="space-y-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-200">
          <p>Your email is not verified. Please check your inbox for the verification link.</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={isResending}
            className="font-medium text-yellow-400 underline underline-offset-2 hover:text-yellow-300 disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend verification email"}
          </button>
        </div>
      )}

      {!showVerificationMessage && (error || formError) && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {formError || "Authentication failed. Please try again."}
        </div>
      )}

      <form onSubmit={handleCredentialsSubmit} className="space-y-4">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("github", { callbackUrl })}
      >
        <Github className="mr-2 h-4 w-4" />
        GitHub
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Register
        </Link>
      </p>
    </>
  );
}
