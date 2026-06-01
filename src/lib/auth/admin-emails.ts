/** Owner admin when ADMIN_EMAILS is not set on the host (override with env in production). */
const DEFAULT_ADMIN_EMAILS = ["sebastian.n.wilhelm@gmail.com"];

/** Lowercased allowlist from ADMIN_EMAILS (comma-separated). Server-only. */
export function getAdminEmailAllowlist(): string[] {
  const raw = process.env.ADMIN_EMAILS?.trim();
  const fromEnv = raw
    ? raw
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];
  if (fromEnv.length > 0) return fromEnv;
  return [...DEFAULT_ADMIN_EMAILS];
}

export function isAllowlistedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = getAdminEmailAllowlist();
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}
