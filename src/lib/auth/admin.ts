import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export async function requireAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/admin");
  }
  const { data } = await supabase.from("admin_roles").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) {
    redirect("/?error=forbidden_admin");
  }
  return user;
}
