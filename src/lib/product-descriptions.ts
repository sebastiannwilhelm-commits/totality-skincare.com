import catalogDescriptions from "@/data/catalog-descriptions.json";

const DESCRIPTIONS = catalogDescriptions as Record<string, string>;

export function productDescriptionHtml(slug: string): string {
  return DESCRIPTIONS[slug] ?? "";
}
