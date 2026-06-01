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
import type { AdminConfigStatus } from "@/lib/auth/admin-config-status";
import { safeNextPath } from "@/lib/auth/safe-next-path";
import {
  ADMIN_LOGIN_CONFIG_HELP,
  ADMIN_SESSION_SECRET_VERCEL_STEPS,
  FIREBASE_PUBLIC_ENV_HELP,
} from "@/lib/firebase/config-help";
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
  if (code === "not_allowlisted_admin")
    return "This account is not authorized for admin. Add your email to ADMIN_EMAILS on Vercel and redeploy.";
  if (code === "admin_session_secret_missing" || code === "could_not_sign_session") return "";
  if (code === "firebase_project_not_configured")
    return "Firebase project ID is not configured (NEXT_PUBLIC_FIREBASE_PROJECT_ID).";
  if (code === "email_not_verified") return "Verify your email before accessing admin.";
  if (code === "email_required") return "Your sign-in must include an email to use admin.";
  if (code === "invalid_id_token") return "Your sign-in could not be verified. Try again.";
  return "Could not complete admin sign-in. Check server logs.";
}

function adminServerConfigHelp(status: AdminConfigStatus | null): string | null {
  if (!status) return null;
  const missing: string[] = [];
  if (!status.adminSession) missing.push("ADMIN_SESSION_SECRET");
  if (!status.adminEmails) missing.push("ADMIN_EMAILS");
  if (missing.length === 0) return null;
  return `Admin sign-in is missing server env on Vercel: ${missing.join(" and ")}. ${ADMIN_LOGIN_CONFIG_HELP}`;
}

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const googleAuto = searchParams.get("google") === "1";
  const urlError = searchParams.get("error");
  const [clientConfigured, setClientConfigured] = React.useState<boolean | null>(null);
  const [serverConfig, setServerConfig] = React.useState<AdminConfigStatus | null>(null);
  const resolvedConfigured = clientConfigured !== false;
  const [adminSetupError, setAdminSetupError] = React.useState(false);

  const configMessage = React.useMemo(() => {
    if (clientConfigured === false) return FIREBASE_PUBLIC_ENV_HELP;
    if (clientConfigured !== true) return null;
    if (urlError === "config" && !adminNextPath(next) && serverConfig && !serverConfig.firebase) {
      return FIREBASE_PUBLIC_ENV_HELP;
    }
    if (urlError === "config" && adminNextPath(next)) {
      if (serverConfig === null) return null;
      if (serverConfig.firebase && serverConfig.adminSession && serverConfig.adminEmails) return null;
      if (!serverConfig.firebase) return FIREBASE_PUBLIC_ENV_HELP;
      return adminServerConfigHelp(serverConfig);
    }
    if (urlError === "config" && serverConfig && !serverConfig.firebase) return FIREBASE_PUBLIC_ENV_HELP;
    return null;
  }, [clientConfigured, urlError, next, serverConfig]);

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
    let cancelled = false;
    async function loadServerConfig() {
      try {
        const res = await fetch("/api/admin/config-status", { credentials: "same-origin" });
        if (!res.ok) return;
        const data = (await res.json()) as AdminConfigStatus;
        if (!cancelled) setServerConfig(data);
      } catch {
        /* ignore */
      }
    }
    void loadServerConfig();
    return () => {
      cancelled = true;
    };
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
              setAdminSetupError(gate.error === "admin_session_secret_missing" || gate.error === "could_not_sign_session");
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
    setAdminSetupError(false);
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
          setAdminSetupError(gate.error === "admin_session_secret_missing" || gate.error === "could_not_sign_session");
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
    setAdminSetupError(false);
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
          setAdminSetupError(gate.error === "admin_session_secret_missing" || gate.error === "could_not_sign_session");
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
      {configMessage ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{configMessage}</p>
      ) : null}
      {adminSetupError ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm text-amber-950">
          <p className="font-medium">Admin sign-in needs server configuration on Vercel</p>
          <p className="mt-1 text-amber-900">
            Firebase sign-in succeeded, but the app cannot set an admin session cookie without{" "}
            <code className="rounded bg-amber-100 px-1">ADMIN_SESSION_SECRET</code>.
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-amber-900">
            {ADMIN_SESSION_SECRET_VERCEL_STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {adminNextPath(next) ? (
            <p className="mt-2">
              <Link href="/admin" className="font-medium underline underline-offset-2">
                /admin
              </Link>{" "}
              opens after you sign in successfully.
            </p>
          ) : null}
        </div>
      ) : null}
      {sessionMessage ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{sessionMessage}</p>
      ) : null}
      {authLinkMessage ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{authLinkMessage}</p>
      ) : null}
      {serverMessage ? (
        <p className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{serverMessage}</p>
      ) : null}
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
