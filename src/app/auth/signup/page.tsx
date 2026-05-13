import { Suspense } from "react";

import { SignupForm } from "./signup-form";

export const metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        One account for checkout history, loyalty balance, and subscriptions.
      </p>
      <div className="mt-8">
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </main>
  );
}
