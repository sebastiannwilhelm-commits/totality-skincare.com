/** In-browser override when NEXT_PUBLIC_* were not inlined at build time. */
let runtimePublic: { url: string; anonKey: string } | null = null;

export function getSupabasePublicRuntimeConfig(): { url: string; anonKey: string } | null {
  return runtimePublic;
}

export function setSupabasePublicRuntimeConfig(env: { url: string; anonKey: string }): void {
  const url = env.url?.trim();
  const anonKey = env.anonKey?.trim();
  if (!url || !anonKey) return;
  if (
    runtimePublic &&
    runtimePublic.url === url &&
    runtimePublic.anonKey === anonKey
  ) {
    return;
  }
  runtimePublic = { url, anonKey };
}
