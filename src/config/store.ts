import type { ConcernSlug, StoreProduct } from "@/lib/types";

/** Canonical public storefront (legacy Shopify until cutover). */
export const LEGACY_STORE_URL = "https://totality-skincare.com" as const;

export const SITE = {
  name: "Totality Skincare",
  tagline: "Totality Medispa & Skincare",
  contactEmail: "info@totalitymed.com",
  phoneDisplay: "843-900-6161",
  phoneTel: "tel:843-900-6161",
  instagram: "https://www.instagram.com/totality_medispa/",
  facebook: "https://www.facebook.com/totalitymed/",
  freeShippingMinCents: 4000,
  legacyQuizUrl: `${LEGACY_STORE_URL}/pages/skin-care-quiz`,
  /** Shopify Tracktor app — same entry customers use today. */
  legacyOrderTrackingUrl: `${LEGACY_STORE_URL}/apps/tracktor/track`,
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

export const BRANDS: { slug: string; label: string }[] = [
  { slug: "obagi", label: "Obagi" },
  { slug: "upneeq", label: "UPNEEQ" },
  { slug: "scientis", label: "Scientis" },
  { slug: "kenra", label: "Kenra" },
  { slug: "glymed-plus", label: "GlyMed Plus" },
  { slug: "moira", label: "Moira" },
];

const u = (id: string, sig: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=720&q=80&sig=${sig}`;

/** Seeded from the live homepage “Our Best Sellers” (prices + handles as of crawl). */
export const PRODUCTS: StoreProduct[] = [
  {
    slug: "upneeq-eyedrops-45-vials",
    name: "UPNEEQ 45 Day Supply",
    description: "Prescription-strength eye drops — fulfillment subject to medical review when required.",
    priceCents: 22000,
    currency: "usd",
    brand: "upneeq",
    concerns: ["anti-aging", "brightening"],
    imageSrc: u("photo-1570172619644-dfd03ed5d881", "up45"),
    isPrescriptionRequired: true,
  },
  {
    slug: "scientis-cyspera-cysteamine-intensive-pigment-corrector",
    name: "Scientis Cyspera Cysteamine Intensive Pigment Corrector",
    description: "Intensive pigment-correcting care for stubborn discoloration.",
    priceCents: 17500,
    currency: "usd",
    brand: "scientis",
    concerns: ["brightening", "anti-aging"],
    imageSrc: u("photo-1616394584738-fc6e612e71b9", "cys"),
    isPrescriptionRequired: false,
  },
  {
    slug: "obagi-clear",
    name: "Obagi Nu-Derm Clear RX 2.0oz",
    description: "Rx clarifying formula — prescription verification applies.",
    priceCents: 13500,
    currency: "usd",
    brand: "obagi",
    concerns: ["brightening", "acne"],
    imageSrc: u("photo-1556228578-0d85b1a4d571", "obc"),
    isPrescriptionRequired: true,
  },
  {
    slug: "kenra-thermal-styling-spray-19",
    name: "Kenra Thermal Styling Spray 19",
    description: "Thermal protection for heat styling.",
    priceCents: 2000,
    currency: "usd",
    brand: "kenra",
    concerns: ["dryness"],
    imageSrc: u("photo-1522338242992-e1a54906a8da", "ken"),
    isPrescriptionRequired: false,
  },
  {
    slug: "glymed-plus-skin-mist-1",
    name: "GlyMed Plus Skin Mist",
    description: "Refreshing facial mist for hydration on the go.",
    priceCents: 8400,
    currency: "usd",
    brand: "glymed-plus",
    concerns: ["dryness", "sensitive"],
    imageSrc: u("photo-1598440947619-2c35fc9aa908", "gly"),
    isPrescriptionRequired: false,
  },
  {
    slug: "obagi-c-rc-norm-dry",
    name: "Obagi C RX Clarifying Serum Normal to Dry",
    description: "Vitamin C clarifying serum — Rx where applicable.",
    priceCents: 15500,
    currency: "usd",
    brand: "obagi",
    concerns: ["brightening", "anti-aging", "dryness"],
    imageSrc: u("photo-1571875257727-256c39da42af", "obcr"),
    isPrescriptionRequired: true,
  },
  {
    slug: "obagitretinoin0-1",
    name: "Obagi Tretinoin 0.1% Cream 0.7 oz",
    description: "Prescription retinoid — Nicole approval workflow required.",
    priceCents: 10500,
    currency: "usd",
    brand: "obagi",
    concerns: ["acne", "anti-aging", "brightening"],
    imageSrc: u("photo-1620916566398-39f1143ab7be", "tre"),
    isPrescriptionRequired: true,
  },
  {
    slug: "upneeq-sample-box-10-vials-1",
    name: "UPNEEQ 10 Day Supply",
    description: "Shorter supply option — prescription rules apply.",
    priceCents: 6500,
    currency: "usd",
    brand: "upneeq",
    concerns: ["anti-aging"],
    imageSrc: u("photo-1515377905702-c7a6da32d1a7", "up10"),
    isPrescriptionRequired: true,
  },
  {
    slug: "moira-lip-appeal-waterproof-liner",
    name: "Moira Lip Appeal Waterproof Liner",
    description: "Waterproof liner — multiple shade options in-store.",
    priceCents: 600,
    currency: "usd",
    brand: "moira",
    concerns: ["brightening"],
    imageSrc: u("photo-1586495777744-4413f21062fa", "moi"),
    isPrescriptionRequired: false,
    comingSoon: true,
  },
];

export function productBySlug(slug: string): StoreProduct | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
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
