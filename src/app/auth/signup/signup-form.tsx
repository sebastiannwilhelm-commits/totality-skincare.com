"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { FIREBASE_PUBLIC_ENV_HELP } from "@/lib/firebase/config-help";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function SignupForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const urlError = searchParams.get("error");
  const [clientConfigured, setClientConfigured] = React.useState<boolean | null>(null);
  const resolvedConfigured = clientConfigured !== false;
  const configMessage = clientConfigured === false || urlError === "config" ? FIREBASE_PUBLIC_ENV_HELP : null;

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [msg, setMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const loginHref = next === "/account" ? "/auth/login" : `/auth/login?next=${encodeURIComponent(next)}`;

  React.useEffect(() => {
    try {
      getFirebaseAuth();
      setClientConfigured(true);
    } catch {
      setClientConfigured(false);
    }
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedConfigured) return;
    setLoading(true);
    setError(null);
    setMsg(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      setError(FIREBASE_PUBLIC_ENV_HELP);
      setLoading(false);
      return;
    }
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (fullName.trim()) {
        await updateProfile(cred.user, { displayName: fullName.trim() });
      }
      window.location.assign(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create account right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const fieldDisabled = clientConfigured === false;

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
