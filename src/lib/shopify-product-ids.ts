import catalogShopifyIds from "@/data/catalog-shopify-ids.json";

const IDS = catalogShopifyIds as Record<string, string>;

export function shopifyProductId(slug: string): string | undefined {
  return IDS[slug];
}
