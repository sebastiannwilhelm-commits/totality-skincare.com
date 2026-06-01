import catalogImages from "@/data/catalog-images.json";

const IMAGES = catalogImages as Record<string, string[]>;

export function productImageUrls(slug: string, fallback: string): string[] {
  const urls = IMAGES[slug];
  if (urls?.length) return urls;
  return fallback ? [fallback] : [];
}
