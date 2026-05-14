import { NextResponse } from "next/server";

import { safeNextPath } from "@/lib/auth/safe-next-path";
import { createClient } from "@/lib/supabase/server";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const loginWithNext = (error: string) =>
    NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error)}&next=${encodeURIComponent(next)}`,
    );

  if (!getSupabasePublicEnv()) {
    return loginWithNext("config");
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return loginWithNext("auth");
}
