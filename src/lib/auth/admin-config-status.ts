import { getAdminEmailAllowlist } from "@/lib/auth/admin-emails";
import { isAdminSessionSigningConfigured } from "@/lib/auth/admin-session-secret";
import { isFirebasePublicConfigured } from "@/lib/firebase/public-env";

export type AdminConfigStatus = {
  firebase: boolean;
  adminSession: boolean;
  adminEmails: boolean;
};

/** Server-only booleans for login UI (no secret values). */
export function getAdminConfigStatus(): AdminConfigStatus {
  return {
    firebase: isFirebasePublicConfigured(),
    adminSession: isAdminSessionSigningConfigured(),
    adminEmails: getAdminEmailAllowlist().length > 0,
  };
}
