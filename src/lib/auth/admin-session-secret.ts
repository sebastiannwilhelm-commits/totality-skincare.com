/**
 * Material used to sign the httpOnly admin session cookie after Firebase sign-in.
 * Prefer ADMIN_SESSION_SECRET; fall back to SUPABASE_SERVICE_ROLE_KEY so admin works
 * when Supabase is already configured for checkout but ADMIN_SESSION_SECRET was not added yet.
 */
export function getAdminSessionSigningMaterial(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET?.trim();
  if (dedicated) return dedicated;
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || null;
}

export function isAdminSessionSigningConfigured(): boolean {
  return getAdminSessionSigningMaterial() !== null;
}
