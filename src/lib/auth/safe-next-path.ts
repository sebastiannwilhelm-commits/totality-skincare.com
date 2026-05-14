/** Restricts open redirects: same-origin path only, must start with a single `/`. */
export function safeNextPath(next: string | null | undefined, fallback = "/account"): string {
  if (next == null || typeof next !== "string") return fallback;
  const t = next.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return fallback;
  if (t.includes("://") || t.includes("\\")) return fallback;
  return t;
}
