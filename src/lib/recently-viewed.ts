const KEY = "totality-recently-viewed-v1";

export function readRecentSlugs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string");
  } catch {
    return [];
  }
}

export function touchRecentSlug(slug: string) {
  if (typeof window === "undefined") return;
  try {
    const prev = readRecentSlugs().filter((s) => s !== slug);
    const next = [slug, ...prev].slice(0, 12);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
