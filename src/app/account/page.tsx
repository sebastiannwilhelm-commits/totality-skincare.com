"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { FIREBASE_PUBLIC_ENV_HELP } from "@/lib/firebase/config-help";
import { getFirebaseAuth } from "@/lib/firebase/client";

export default function AccountPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [configError, setConfigError] = React.useState<string | null>(null);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      setConfigError(FIREBASE_PUBLIC_ENV_HELP);
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setReady(true);
    });
    return () => unsub();
  }, []);

  async function onSignOut() {
    try {
      setSigningOut(true);
      await signOut(getFirebaseAuth());
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="text-sm text-muted-foreground">Loading account…</p>
      </main>
    );
  }

  if (configError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {configError}
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need to sign in to view your account.</p>
        <Link href="/auth/login?next=/account" className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.displayName || user.email}</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={signingOut} onClick={onSignOut}>
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>

      <section className="mt-10 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Account details</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Signed in with Firebase as <span className="font-medium text-foreground">{user.email}</span>.
        </p>
      </section>
    </main>
  );
}
