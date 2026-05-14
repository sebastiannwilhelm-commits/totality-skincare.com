import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicEnv } from "@/lib/supabase/public-env";
import { getSupabasePublicRuntimeConfig } from "@/lib/supabase/runtime-public";

export function createClient() {
  const env = getSupabasePublicRuntimeConfig() ?? getSupabasePublicEnv();
  if (!env) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createBrowserClient(env.url, env.anonKey);
}
