import { getAdminEmailAllowlist } from "@/lib/auth/admin-emails";
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
    adminSession: Boolean(process.env.ADMIN_SESSION_SECRET?.trim()),
    adminEmails: getAdminEmailAllowlist().length > 0,
  };
}
