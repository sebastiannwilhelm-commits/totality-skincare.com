import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAdminEmailAllowlist, isAllowlistedAdminEmail } from "@/lib/auth/admin-emails";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session-token";
import { createClient } from "@/lib/supabase/server";

export type AdminUser = {
  id: string;
  email?: string | null;
};

async function tryFirebaseAllowlistSession(): Promise<AdminUser | null> {
  if (getAdminEmailAllowlist().length === 0) return null;
  if (!process.env.ADMIN_SESSION_SECRET?.trim()) return null;
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!raw) return null;
  const parsed = await verifyAdminSessionToken(raw);
  if (!parsed) return null;
  if (!isAllowlistedAdminEmail(parsed.email)) return null;
  return { id: parsed.uid, email: parsed.email };
}

function firebaseAdminLoginConfigured(): boolean {
  return getAdminEmailAllowlist().length > 0 && Boolean(process.env.ADMIN_SESSION_SECRET?.trim());
}

export async function requireAdminUser(): Promise<AdminUser> {
  const fbUser = await tryFirebaseAllowlistSession();
  if (fbUser) return fbUser;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    if (firebaseAdminLoginConfigured()) {
      redirect("/auth/login?next=/admin");
    }
    redirect("/auth/login?next=/admin&error=config");
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/auth/login?next=/admin&error=server");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    redirect("/auth/login?next=/admin&error=session");
  }

  if (user) {
    const { data } = await supabase.from("admin_roles").select("user_id").eq("user_id", user.id).maybeSingle();
    if (data) {
      return { id: user.id, email: user.email };
    }
    const fb = await tryFirebaseAllowlistSession();
    if (fb) return fb;
    redirect("/?error=forbidden_admin");
  }

  if (firebaseAdminLoginConfigured()) {
    redirect("/auth/login?next=/admin");
  }

  redirect("/auth/login?next=/admin");
}
