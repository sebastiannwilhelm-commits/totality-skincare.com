"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";

import { Button } from "@/components/ui/button";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import { FIREBASE_PUBLIC_ENV_HELP } from "@/lib/firebase/config-help";
import { getFirebaseAuth } from "@/lib/firebase/client";

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const urlError = searchParams.get("error");
  const [clientConfigured, setClientConfigured] = React.useState<boolean | null>(null);
  const resolvedConfigured = clientConfigured !== false;
  const configMessage = clientConfigured === false || urlError === "config" ? FIREBASE_PUBLIC_ENV_HELP : null;
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
  const [googleLoading, setGoogleLoading] = React.useState(false);

  React.useEffect(() => {
    try {
      getFirebaseAuth();
      setClientConfigured(true);
    } catch {
      setClientConfigured(false);
    }
  }, []);

  React.useEffect(() => {
    if (!resolvedConfigured) return;
    let cancelled = false;
    async function checkRedirectResult() {
      try {
        const auth = getFirebaseAuth();
        const result = await getRedirectResult(auth);
        if (!cancelled && result?.user) {
          window.location.assign(next);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Unable to finish Google sign-in.";
          setError(message);
        }
      }
    }
    void checkRedirectResult();
    return () => {
      cancelled = true;
    };
  }, [next, resolvedConfigured]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedConfigured) return;
    setLoading(true);
    setError(null);
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      setError(FIREBASE_PUBLIC_ENV_HELP);
      setLoading(false);
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.assign(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function onGoogleSignIn() {
    if (!resolvedConfigured) return;
    setError(null);
    setGoogleLoading(true);
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      setError(FIREBASE_PUBLIC_ENV_HELP);
      setGoogleLoading(false);
      return;
    }

    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      window.location.assign(next);
      return;
    } catch (err) {
      const code = typeof err === "object" && err && "code" in err ? String(err.code) : "";
      if (code === "auth/popup-blocked") {
        await signInWithRedirect(auth, provider);
        return;
      }
      const message = err instanceof Error ? err.message : "Unable to sign in with Google.";
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
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
          disabled={clientConfigured === false}
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
          disabled={clientConfigured === false}
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" variant="blush" disabled={clientConfigured === false || loading}>
        {loading ? "Signing in…" : "Sign in"}
      </Button>
      <Button
        type="button"
        className="w-full"
        variant="outline"
        disabled={clientConfigured === false || googleLoading}
        onClick={onGoogleSignIn}
      >
        {googleLoading ? "Connecting to Google…" : "Continue with Google"}
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
