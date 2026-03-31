"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage("Missing verification token.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json();
          setStatus("error");
          setErrorMessage(data.error || "Verification failed.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Something went wrong. Please try again.");
      });
  }, [token]);

  if (status === "loading") {
    return (
      <div className="space-y-4">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
        <h1 className="text-2xl font-bold text-foreground">Email verified!</h1>
        <p className="text-muted-foreground">
          Your email has been verified. You can now sign in.
        </p>
        <Link href="/sign-in" className={buttonVariants({ className: "w-full" })}>
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <XCircle className="mx-auto h-10 w-10 text-destructive" />
      <h1 className="text-2xl font-bold text-foreground">
        Verification failed
      </h1>
      <p className="text-muted-foreground">{errorMessage}</p>
      <Link
        href="/sign-in"
        className={buttonVariants({ variant: "outline", className: "w-full" })}
      >
        Back to sign in
      </Link>
    </div>
  );
}
