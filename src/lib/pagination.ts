export const PRODUCTS_PER_PAGE = 24;

export function parsePageParam(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Build `?page=` while preserving other query params on `basePath` (may include `?type=`). */
export function buildPageUrl(basePath: string, page: number): string {
  const qIndex = basePath.indexOf("?");
  const path = qIndex === -1 ? basePath : basePath.slice(0, qIndex);
  const params = new URLSearchParams(qIndex === -1 ? "" : basePath.slice(qIndex + 1));
  if (page > 1) params.set("page", String(page));
  else params.delete("page");
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

export function paginate<T>(items: T[], page: number, perPage: number = PRODUCTS_PER_PAGE) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: safePage,
    totalPages,
    total,
    perPage,
  };
}
