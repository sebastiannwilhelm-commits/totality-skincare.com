import Link from "next/link";
import { Suspense } from "react";

import { LoginForm } from "./login-form";
import { isSupabasePublicConfigured } from "@/lib/supabase/public-env";

export const metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const supabaseConfigured = isSupabasePublicConfigured();
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
      <div className="mt-8">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
          <LoginForm supabaseConfigured={supabaseConfigured} />
        </Suspense>
      </div>
    </main>
  );
}
