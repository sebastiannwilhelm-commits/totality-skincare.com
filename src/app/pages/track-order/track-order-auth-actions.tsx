"use client";

import * as React from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { getFirebaseAuth } from "@/lib/firebase/client";

type AuthCtaState =
  | { kind: "disabled" }
  | { kind: "loading" }
  | { kind: "ready"; signedIn: boolean };

const ACCOUNT_NEXT = "/account";

export function TrackOrderAuthActions() {
  const [state, setState] = React.useState<AuthCtaState>({ kind: "loading" });

  React.useEffect(() => {
    let auth: ReturnType<typeof getFirebaseAuth> | null = null;
    try {
      auth = getFirebaseAuth();
    } catch {
      setState({ kind: "disabled" });
      return;
    }

    const unsub = onAuthStateChanged(auth, (user) => {
      setState({ kind: "ready", signedIn: !!user });
    });
    return () => {
      unsub();
    };
  }, []);

  const showGuests =
    state.kind === "disabled" ||
    state.kind === "loading" ||
    (state.kind === "ready" && !state.signedIn);
  const showAccount = state.kind === "ready" && state.signedIn;

  const loginHref = `/auth/login?next=${encodeURIComponent(ACCOUNT_NEXT)}`;
  const signupHref = `/auth/signup?next=${encodeURIComponent(ACCOUNT_NEXT)}`;
  const loginGoogleHref = `/auth/login?next=${encodeURIComponent(ACCOUNT_NEXT)}&google=1`;
  const signupGoogleHref = `/auth/signup?next=${encodeURIComponent(ACCOUNT_NEXT)}&google=1`;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex flex-wrap gap-3">
        {showGuests ? (
          <>
            <Button asChild variant="outline" size="lg">
              <Link href={loginHref}>Sign in</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={signupHref}>Sign up</Link>
            </Button>
          </>
        ) : null}
        {showAccount ? (
          <Button asChild variant="outline" size="lg">
            <Link href="/account">Account</Link>
          </Button>
        ) : null}
      </div>
      {showGuests ? (
        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline" size="lg">
            <Link href={loginGoogleHref}>Continue with Google</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href={signupGoogleHref}>Sign up with Google</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
