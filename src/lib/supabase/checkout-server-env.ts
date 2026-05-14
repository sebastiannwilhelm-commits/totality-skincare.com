/** Cart checkout loads catalog/prices from Supabase with the service role. */
export function isSupabaseServiceConfiguredForCheckout(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
