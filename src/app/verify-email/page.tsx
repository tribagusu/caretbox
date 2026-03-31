import { VerifyEmailClient } from "@/components/auth/VerifyEmailClient";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <Suspense
          fallback={
            <p className="text-muted-foreground">Verifying your email...</p>
          }
        >
          <VerifyEmailClient />
        </Suspense>
      </div>
    </div>
  );
}
