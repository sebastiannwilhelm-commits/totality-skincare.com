"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { SUPABASE_PUBLIC_ENV_HELP } from "@/lib/supabase/config-help";
import { createClient } from "@/lib/supabase/client";

type SignupFormProps = {
  supabaseConfigured: boolean;
};

export function SignupForm({ supabaseConfigured }: SignupFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const urlError = searchParams.get("error");
  const configMessage = !supabaseConfigured || urlError === "config" ? SUPABASE_PUBLIC_ENV_HELP : null;

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const loginHref = next === "/account" ? "/auth/login" : `/auth/login?next=${encodeURIComponent(next)}`;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabaseConfigured) return;
    setLoading(true);
    setError(null);
    setMsg(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setError(SUPABASE_PUBLIC_ENV_HELP);
      setLoading(false);
      return;
    }
    const origin = window.location.origin;
    const callback = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: callback,
        data: { full_name: fullName },
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }
    setMsg("Check your email to confirm your account, then sign in.");
  }

  const fieldDisabled = !supabaseConfigured;

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-sm space-y-4">
      {configMessage ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{configMessage}</p>
      ) : null}
      <div>
        <label className="text-sm font-medium" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          autoComplete="name"
          required
          disabled={fieldDisabled}
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          disabled={fieldDisabled}
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
          autoComplete="new-password"
          required
          minLength={8}
          disabled={fieldDisabled}
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="confirm-password">
          Confirm password
        </label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={fieldDisabled}
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {msg ? <p className="text-sm text-green-800">{msg}</p> : null}
      <Button type="submit" className="w-full" variant="blush" disabled={fieldDisabled || loading}>
        {loading ? "Creating…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href={loginHref} className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
