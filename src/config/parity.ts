/**
 * Maps [totality-skincare.com](https://totality-skincare.com) (Shopify + apps) to this codebase.
 * Use this file when scoping work so nothing important is forgotten.
 */
export type ParityStatus = "done" | "partial" | "planned";

export type ParityRow = {
  id: string;
  liveSource: string;
  status: ParityStatus;
  notes: string;
};

export const TOT_SKINCARE_PARITY: ParityRow[] = [
  {
    id: "home-hero-quiz",
    liveSource: "Home hero + “Match Me With the Right Products” → /pages/skin-care-quiz",
    status: "done",
    notes:
      "Octane AI embed (quiz id LIYfTYmw49oOSyrr, fullscreen) — same as Shopify page.",
  },
  {
    id: "sale-banner",
    liveSource: "Promotional / sale strip",
    status: "partial",
    notes: "Top promo bar is config-driven; wire to CMS or Supabase promos later.",
  },
  {
    id: "shipping-threshold",
    liveSource: "Free Shipping on Order $40+",
    status: "done",
    notes: "Messaging on home + cart summary.",
  },
  {
    id: "trust-dr-nadel",
    liveSource: "Trusted by Dr. Nadel",
    status: "done",
    notes: "Trust strip + founder section for Dr. Nicole Nadel.",
  },
  {
    id: "site-search",
    liveSource: "Storefront search",
    status: "done",
    notes: "Header search modal filters the seeded catalog client-side.",
  },
  {
    id: "best-sellers",
    liveSource: "OUR BEST SELLERS grid",
    status: "done",
    notes: "Product data seeded from public catalog slugs/prices on the live homepage.",
  },
  {
    id: "shop-by-brand",
    liveSource: "SHOP BY BRANDS",
    status: "done",
    notes: "Routes under /collections/brand/[slug].",
  },
  {
    id: "shop-by-concern",
    liveSource: "SHOP BY CONCERN",
    status: "done",
    notes: "Routes under /collections/concern/[slug].",
  },
  {
    id: "testimonials",
    liveSource: "What Our Customers Are Saying",
    status: "partial",
    notes: "Static quotes; move to Supabase or headless CMS when content is finalized.",
  },
  {
    id: "founder-story",
    liveSource: "Doctor Founded & Approved",
    status: "done",
    notes: "Dr. Nadel CMO copy aligned with live positioning.",
  },
  {
    id: "newsletter",
    liveSource: "GET ON THE LIST (Klaviyo-style signup)",
    status: "partial",
    notes: "Form posts to /api/newsletter (stub); connect Resend + audience table in a later phase.",
  },
  {
    id: "cookies",
    liveSource: "Cookie consent bar",
    status: "done",
    notes: "Local preference only; add analytics consent categories when GTM/GA is added.",
  },
  {
    id: "cart-checkout",
    liveSource: "Cart + Shopify Checkout",
    status: "partial",
    notes: "Local cart UI; Stripe Checkout + Rx flow per your phased plan.",
  },
  {
    id: "account-auth",
    liveSource: "Customer accounts / login",
    status: "planned",
    notes: "Supabase Auth + /account; replaces Shopify customer accounts.",
  },
  {
    id: "flits-loyalty",
    liveSource: "Flits (store credit, referrals, reorder, social login, OTP)",
    status: "planned",
    notes: "Requires loyalty tables + rules engine or third-party; not 1:1 without scope.",
  },
  {
    id: "order-tracking",
    liveSource: "Tracktor / Flits order tracking links",
    status: "partial",
    notes:
      "Route /pages/track-order links to the live Shopify Tracktor URL; native tracking after Shippo + orders API.",
  },
  {
    id: "subscriptions",
    liveSource: "Appstle / subscription wording in Flits nav",
    status: "planned",
    notes: "Stripe Billing subscriptions in your Phase 2+ scope.",
  },
  {
    id: "wishlist",
    liveSource: "Wishlist (Flits — may be off on live plan)",
    status: "partial",
    notes: "Heart on cards + /wishlist; localStorage until Supabase per-user wishlists.",
  },
  {
    id: "blog",
    liveSource: "/blogs/news",
    status: "partial",
    notes: "Hub at /blogs/news opens the live Shopify blog until content is migrated.",
  },
  {
    id: "contact-page",
    liveSource: "Contact / support",
    status: "partial",
    notes: "Route /pages/contact + /api/contact stub; connect to helpdesk or Resend routing.",
  },
  {
    id: "search-url",
    liveSource: "Search results page (e.g. /search?q=)",
    status: "done",
    notes: "Dedicated /search plus header modal deep link to view all results.",
  },
  {
    id: "recently-viewed",
    liveSource: "Recently viewed products (Flits)",
    status: "partial",
    notes: "Home section + PDP tracker via localStorage; sync to account when Auth ships.",
  },
  {
    id: "policies",
    liveSource: "Refund / privacy / terms",
    status: "partial",
    notes: "Footer links to live policy URLs until legal copy is hosted here.",
  },
];
