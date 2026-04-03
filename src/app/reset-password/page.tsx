import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Choose a new password
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your new password below
          </p>
        </div>

        <Suspense
          fallback={
            <p className="text-center text-muted-foreground">Loading...</p>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
