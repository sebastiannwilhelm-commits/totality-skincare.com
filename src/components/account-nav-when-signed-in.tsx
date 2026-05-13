"use client";

import * as React from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";

type Props = {
  className?: string;
  onClick?: () => void;
};

/** Renders the “Account” nav link only when a Supabase session is present. */
export function AccountNavWhenSignedIn({ className, onClick }: Props) {
  const [signedIn, setSignedIn] = React.useState(false);

  React.useEffect(() => {
    let supabase: ReturnType<typeof createClient> | null = null;
    try {
      supabase = createClient();
    } catch {
      return;
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(!!session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!signedIn) return null;

  return (
    <Link href="/account" className={className} onClick={onClick}>
      Account
    </Link>
  );
}
