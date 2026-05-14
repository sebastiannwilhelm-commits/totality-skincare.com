"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { SUPABASE_PUBLIC_ENV_HELP } from "@/lib/supabase/config-help";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  /** From the server: false when public Supabase env vars are missing for this build. */
  supabaseConfigured: boolean;
};

export function LoginForm({ supabaseConfigured }: LoginFormProps) {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const urlError = searchParams.get("error");
  const configMessage = !supabaseConfigured || urlError === "config" ? SUPABASE_PUBLIC_ENV_HELP : null;
  const sessionMessage =
    urlError === "session"
      ? "We could not validate your session. Please sign in again."
      : null;
  const authLinkMessage =
    urlError === "auth"
      ? "That sign-in link could not be completed. Request a new link or sign in with your password."
      : null;
  const serverMessage =
    urlError === "server"
      ? "We could not reach the auth service. Wait a moment and try again, or refresh the page."
      : null;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) return;
    setLoading(true);
    setError(null);
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError(SUPABASE_PUBLIC_ENV_HELP);
      setLoading(false);
      return;
    }
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    // Full navigation so the next document request includes auth cookies (avoids RSC/client cookie lag after password sign-in).
    window.location.assign(next);
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4">
      {configMessage ? <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{configMessage}</p> : null}
      {sessionMessage ? <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{sessionMessage}</p> : null}
      {authLinkMessage ? <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{authLinkMessage}</p> : null}
      {serverMessage ? <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{serverMessage}</p> : null}
      <div>
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          disabled={!supabaseConfigured}
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={!supabaseConfigured}
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" variant="blush" disabled={!supabaseConfigured || loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        No account?{" "}
        <Link
          href={next === "/account" ? "/auth/signup" : `/auth/signup?next=${encodeURIComponent(next)}`}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </p>
    </form>
  );
}
