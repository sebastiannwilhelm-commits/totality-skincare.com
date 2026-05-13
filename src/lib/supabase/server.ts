import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

import { isSupabasePublicConfigured } from "./config";

async function createServerSupabase() {
  // `await` keeps this compatible if `cookies()` becomes async (Next 15+).
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim();

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Component — cookies may be read-only; middleware refreshes session */
        }
      },
    },
  });
}

/** Throws if public Supabase env is missing (for routes that must error when misconfigured). */
export async function createClient() {
  if (!isSupabasePublicConfigured()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createServerSupabase();
}

/** Returns null when public Supabase env is missing so pages can render a friendly message. */
export async function createClientIfConfigured() {
  if (!isSupabasePublicConfigured()) return null;
  return createServerSupabase();
}
