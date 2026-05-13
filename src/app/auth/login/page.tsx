import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const raw = searchParams.error;
  const authErr = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
  const banner =
    authErr === "config"
      ? "Sign-in is not fully configured (missing Supabase keys on the server). Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your host settings."
      : authErr === "session"
        ? "Your session could not be verified. Please sign in again."
        : authErr === "server"
          ? "Something went wrong loading your account. Please try signing in again."
          : null;

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use your Totality storefront account (Supabase Auth). Admins with a role row can access{" "}
        <Link href="/admin" className="underline-offset-4 hover:underline">
          /admin
        </Link>
        .
      </p>
      {banner ? (
        <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{banner}</p>
      ) : null}
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
