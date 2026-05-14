"use client";

import * as React from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

type HeaderAuthState =
  | { kind: "disabled" }
  | { kind: "loading" }
  | { kind: "ready"; signedIn: boolean };

const HeaderAuthContext = React.createContext<HeaderAuthState>({ kind: "loading" });

const desktopGuestLinkClass =
  "shrink-0 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]";
const desktopAccountLinkClass =
  "relative z-10 shrink-0 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]";
const mobileLinkClass = "rounded-md px-3 py-2 hover:bg-muted";

export function HeaderSupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<HeaderAuthState>({ kind: "loading" });

  React.useEffect(() => {
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
    } catch {
      setState({ kind: "disabled" });
      return;
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setState({ kind: "ready", signedIn: !!session });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ kind: "ready", signedIn: !!session });
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  return <HeaderAuthContext.Provider value={state}>{children}</HeaderAuthContext.Provider>;
}

function useHeaderAuthState(): HeaderAuthState {
  return React.useContext(HeaderAuthContext);
}

export function HeaderSupabaseAuthDesktop() {
  const state = useHeaderAuthState();
  // Without Supabase env we cannot know session; still show auth entry points.
  const showGuests =
    state.kind === "disabled" ||
    state.kind === "loading" ||
    (state.kind === "ready" && !state.signedIn);
  const showAccount = state.kind === "ready" && state.signedIn;

  return (
    <>
      {showGuests ? (
        <>
          <Link href="/auth/login" className={desktopGuestLinkClass}>
            Sign in
          </Link>
          <Link href="/auth/signup" className={desktopGuestLinkClass}>
            Sign up
          </Link>
        </>
      ) : null}
      {showAccount ? (
        <Link href="/account" className={desktopAccountLinkClass}>
          Account
        </Link>
      ) : null}
    </>
  );
}

export function HeaderSupabaseAuthDrawer({ onLinkClick }: { onLinkClick: () => void }) {
  const state = useHeaderAuthState();
  const showGuests =
    state.kind === "disabled" ||
    state.kind === "loading" ||
    (state.kind === "ready" && !state.signedIn);
  const showAccount = state.kind === "ready" && state.signedIn;

  return (
    <>
      {showGuests ? (
        <>
          <Link href="/auth/login" onClick={onLinkClick} className={mobileLinkClass}>
            Sign in
          </Link>
          <Link href="/auth/signup" onClick={onLinkClick} className={mobileLinkClass}>
            Sign up
          </Link>
        </>
      ) : null}
      {showAccount ? (
        <Link href="/account" onClick={onLinkClick} className={mobileLinkClass}>
          Account
        </Link>
      ) : null}
    </>
  );
}
