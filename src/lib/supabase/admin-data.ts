import { createServiceClient } from "@/lib/supabase/service";

/** Service-role client for `/admin` RSCs only (bypasses RLS). Call after `requireAdminUser()`. */
export function createAdminDataClient() {
  return createServiceClient();
}
