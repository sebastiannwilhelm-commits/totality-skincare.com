"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Auth } from "firebase/auth";
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

/** Avoid double Google auto-start in React Strict Mode (dev) remounts. */
let loginFormGoogleAutoOnce = false;

function adminNextPath(next: string): boolean {
  return next === "/admin" || next.startsWith("/admin/");
}

async function establishFirebaseAdminSession(auth: Auth): Promise<{ ok: true } | { ok: false; error: string }> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) return { ok: false, error: "no_id_token" };
  const res = await fetch("/api/admin/firebase-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ idToken }),
  });
  if (res.ok) return { ok: true };
  let code = "admin_session_failed";
  try {
    const j = (await res.json()) as { error?: string };
    if (typeof j.error === "string") code = j.error;
  } catch {
    /* ignore */
  }
  return { ok: false, error: code };
}

function mapAdminSessionError(code: string): string {
  if (code === "not_allowlisted_admin") return "This account is not authorized for admin.";
  if (code === "admin_session_secret_missing" || code === "could_not_sign_session")
    return "Admin sign-in is not fully configured on the server (missing ADMIN_SESSION_SECRET).";
  if (code === "firebase_project_not_configured") return "Firebase project ID is not configured (NEXT_PUBLIC_FIREBASE_PROJECT_ID).";
  if (code === "email_not_verified") return "Verify your email before accessing admin.";
  if (code === "email_required") return "Your sign-in must include an email to use admin.";
  if (code === "invalid_id_token") return "Your sign-in could not be verified. Try again.";
  return "Could not complete admin sign-in. Check server logs.";
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const googleAuto = searchParams.get("google") === "1";
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
          if (adminNextPath(next)) {
            const gate = await establishFirebaseAdminSession(auth);
            if (!gate.ok) {
              setError(mapAdminSessionError(gate.error));
              return;
            }
          }
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
      if (adminNextPath(next)) {
        const gate = await establishFirebaseAdminSession(auth);
        if (!gate.ok) {
          setError(mapAdminSessionError(gate.error));
          return;
        }
      }
      window.location.assign(next);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in right now.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const onGoogleSignIn = React.useCallback(async () => {
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
      if (adminNextPath(next)) {
        const gate = await establishFirebaseAdminSession(auth);
        if (!gate.ok) {
          setError(mapAdminSessionError(gate.error));
          return;
        }
      }
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
  }, [next, resolvedConfigured]);

  React.useEffect(() => {
    if (!googleAuto || !resolvedConfigured) return;
    if (loginFormGoogleAutoOnce) return;
    loginFormGoogleAutoOnce = true;
    void onGoogleSignIn();
  }, [googleAuto, resolvedConfigured, onGoogleSignIn]);

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
        onClick={() => void onGoogleSignIn()}
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
