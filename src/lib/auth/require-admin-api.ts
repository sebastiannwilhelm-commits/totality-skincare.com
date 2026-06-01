import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAdminEmailAllowlist, isAllowlistedAdminEmail } from "@/lib/auth/admin-emails";
import { isAdminSessionSigningConfigured } from "@/lib/auth/admin-session-secret";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session-token";
import { createClient } from "@/lib/supabase/server";

export type AdminApiUser = { id: string; email: string };

async function tryFirebaseAllowlistSession(): Promise<AdminApiUser | null> {
  if (getAdminEmailAllowlist().length === 0) return null;
  if (!isAdminSessionSigningConfigured()) return null;
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return null;
  const parsed = await verifyAdminSessionToken(raw);
  if (!parsed) return null;
  if (!isAllowlistedAdminEmail(parsed.email)) return null;
  return { id: parsed.uid, email: parsed.email };
}

/** For Route Handlers: returns admin user or a 401/403 JSON response. */
export async function requireAdminApi(): Promise<AdminApiUser | NextResponse> {
  const fb = await tryFirebaseAllowlistSession();
  if (fb) return fb;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return NextResponse.json({ error: "admin_config" }, { status: 503 });
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data } = await supabase.from("admin_roles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  return { id: user.id, email: user.email ?? "" };
}

export function isAdminApiError(result: AdminApiUser | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
