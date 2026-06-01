import type { ConcernSlug, StoreProduct } from "@/lib/types";
import { BEST_SELLER_SLUGS } from "@/config/best-sellers";
import { CATALOG_BRANDS, CATALOG_PRODUCTS } from "@/config/catalog-products";

/** Canonical public storefront (legacy Shopify until cutover). */
export const LEGACY_STORE_URL = "https://totality-skincare.com" as const;

export const SITE = {
  name: "Totality Skincare",
  tagline: "Totality Medispa & Skincare",
  logoSrc:
    "https://totality-skincare.com/cdn/shop/files/Totality-Skin-Care-Logo_2000x.png?v=1692597087",
  /** Judge.me + Shopify product widgets */
  shopifyDomain: "totality-skincare.myshopify.com",
  copyrightName: "Totality Medispa and Skincare",
  contactEmail: "info@totality-skincare.com",
  phoneDisplay: "(843) 998-7405",
  phoneTel: "tel:+18439987405",
  faxDisplay: "843-284-9559",
  instagram: "https://www.instagram.com/totality_medispa/",
  facebook: "https://www.facebook.com/totalitymed/",
  freeShippingMinCents: 4000,
  legacyQuizUrl: `${LEGACY_STORE_URL}/pages/skin-care-quiz`,
  /** Shopify Tracktor app — same entry customers use today. */
  legacyOrderTrackingUrl: `${LEGACY_STORE_URL}/apps/tracktor/track`,
  legacyRewardsUrl: `${LEGACY_STORE_URL}/pages/rewards`,
  legacyBlogNewsUrl: `${LEGACY_STORE_URL}/blogs/news`,
  policies: {
    refund: `${LEGACY_STORE_URL}/policies/refund-policy`,
    privacy: `${LEGACY_STORE_URL}/policies/privacy-policy`,
    terms: `${LEGACY_STORE_URL}/policies/terms-of-service`,
    shipping: `${LEGACY_STORE_URL}/policies/shipping-policy`,
  },
} as const;

export const CONCERNS: { slug: ConcernSlug; label: string; blurb: string }[] = [
  { slug: "acne", label: "Acne", blurb: "Clarifying routines for breakout-prone skin." },
  { slug: "oily", label: "Oily", blurb: "Balance and refine without stripping." },
  { slug: "sensitive", label: "Sensitive", blurb: "Gentle, dermatologist-trusted options." },
  { slug: "dryness", label: "Dryness", blurb: "Barrier support and deep hydration." },
  { slug: "anti-aging", label: "Anti-Aging", blurb: "Medical-grade actives for visible renewal." },
  { slug: "brightening", label: "Brightening", blurb: "Even tone and radiance-forward care." },
];

/** Brands aligned with Shopify `vendor` (see `scripts/generate-catalog.mjs`). */
export const BRANDS: { slug: string; label: string }[] = CATALOG_BRANDS;

/** Full Totality Skincare sellable catalog from Shopify `collections/all` (live site). */
export const PRODUCTS: StoreProduct[] = CATALOG_PRODUCTS;

export function productBySlug(slug: string): StoreProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function bestSellerProducts(): StoreProduct[] {
  return BEST_SELLER_SLUGS.map((slug) => productBySlug(slug)).filter(
    (p): p is StoreProduct => p !== undefined,
  );
}

/** Hair / makeup filters for shop nav (product_type from Shopify catalog). */
export function productsByProductType(match: "hair" | "makeup"): StoreProduct[] {
  const re =
    match === "hair"
      ? /\bhair\b/i
      : /\bmakeup|lip|lash|brow|nail|cosmetic|liner|lipstick|mascara\b/i;
  return PRODUCTS.filter((p) => re.test(p.name) || re.test(p.description));
}

export function productsByBrand(brandSlug: string): StoreProduct[] {
  return PRODUCTS.filter((p) => p.brand === brandSlug);
}

export function productsByConcern(concern: ConcernSlug): StoreProduct[] {
  return PRODUCTS.filter((p) => p.concerns.includes(concern));
}

export function formatMoney(cents: number, currency: string = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}
