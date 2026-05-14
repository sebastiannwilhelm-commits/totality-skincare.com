"use client";

import * as React from "react";

import { setSupabasePublicRuntimeConfig } from "@/lib/supabase/runtime-public";

export type SupabasePublicBootstrapProps = {
  url: string;
  anonKey: string;
};

/**
 * Applies server-known public Supabase config before other client effects run,
 * so `createClient()` works even when build-time NEXT_PUBLIC_* inlining failed.
 */
export function SupabasePublicBootstrap({ url, anonKey }: SupabasePublicBootstrapProps) {
  React.useLayoutEffect(() => {
    setSupabasePublicRuntimeConfig({ url, anonKey });
  }, [url, anonKey]);

  return null;
}
