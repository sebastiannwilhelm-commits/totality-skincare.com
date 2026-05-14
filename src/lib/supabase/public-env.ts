/** Public Supabase keys (safe in the browser). Used on server + client. */
function readEnv(...keys: string[]): string | null {
  for (const key of keys) {
    const value = process.env[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = readEnv("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const anonKey = readEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY");
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabasePublicConfigured(): boolean {
  return getSupabasePublicEnv() !== null;
}
