import { Suspense } from "react";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Sign in to Caretbox
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your developer knowledge hub
          </p>
        </div>

        <Suspense>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  );
}
