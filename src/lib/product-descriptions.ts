import catalogDescriptions from "@/data/catalog-descriptions.json";

import { normalizeProductHtml } from "@/lib/normalize-product-html";

const DESCRIPTIONS = catalogDescriptions as Record<string, string>;

export function productDescriptionHtml(slug: string): string {
  const raw = DESCRIPTIONS[slug] ?? "";
  return normalizeProductHtml(raw);
}
