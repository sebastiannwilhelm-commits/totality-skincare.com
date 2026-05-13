import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireAdminUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
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
  if (!user) {
    redirect("/auth/login?next=/admin");
  }
  const { data } = await supabase.from("admin_roles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) {
    redirect("/?error=forbidden_admin");
  }
  return user;
}
