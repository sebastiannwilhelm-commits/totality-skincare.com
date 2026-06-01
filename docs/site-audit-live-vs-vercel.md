# Site audit: Live vs Vercel preview

**Audit date:** 2026-06-01  
**Reference (live):** https://totality-skincare.com (Shopify + apps)  
**New build:** https://totality-skincare-com.vercel.app (Next.js 14 preview)  
**Repo:** `palmetto-developments-storefront`

## Executive summary (top 5 issues)

1. **Home “Our best sellers” renders the entire catalog (~1,153 products)** instead of the ~10 curated items on live — severe performance, scroll, and UX regression (`BestSellersSection` maps `PRODUCTS`, not a bestseller list).
2. **Checkout cannot complete on Vercel** — “Pay securely with Stripe” is disabled; deployment reports missing `STRIPE_SECRET_KEY` and Supabase server vars for cart checkout.
3. **Shop-all and collection pages load very large grids** with no pagination; combined with the home bug, mobile/desktop pages become extremely long and heavy.
4. **PDP parity gaps on Rx and hero SKUs** — live Obagi/Cyspera pages include Judge.me reviews, multi-image galleries, “Subscribe and save,” and “Complete your beauty routine”; Vercel PDPs are single-image, no reviews, no subscription option.
5. **Navigation and loyalty differ materially** — live has Shop mega-menu (Skin Care, Hair Care, Makeup, etc.), Flits rewards/subscriptions, and image logo; Vercel uses a simplified header, text logo, wishlist, and “My Rewards” → `/account` without Flits.

---

## Bugs

| Priority | Page | Issue | Live | Vercel | Repro |
|----------|------|-------|------|--------|-------|
| **P0** | `/` | “Our best sellers” shows **all catalog products** (~1,153 cards) | ~10 products in “OUR BEST SELLERS” | Full `PRODUCTS` array in grid | Open home → scroll; compare DOM size / scroll length |
| **P0** | `/checkout` | Payment disabled | Shopify Checkout | Button disabled; copy cites missing Stripe + Supabase env | Add item → Cart → Checkout |
| **P0** | `/shop` | Entire catalog on one page, no pagination | Shopify collection UX (paginated / filtered) | 1,153 `ProductCard`s | Open `/shop` on mobile 390px |
| **P1** | `/products/obagi-clear` (and other PDPs) | No star ratings / review tab | Judge.me: 4.9★, 14 reviews, review search | No reviews UI | Compare PDPs side by side |
| **P1** | `/products/obagi-clear` | No image gallery | 4 thumbnails + carousel | Single `imageSrc` | Open live PDP vs Vercel |
| **P1** | `/products/obagi-clear` | No subscription pricing | “Subscribe and save (Save 16%)” + Appstle | One-time add to cart only | Live PDP purchase options |
| **P1** | `/` (Shop by brands) | Some brand logos leave the new site | All brand tiles stay on Shopify | FactorFive, Haleys, GLO link to `totality-skincare.com/collections/...` | Click those logos on Vercel home |
| **P1** | Footer → My Rewards | Expect Flits loyalty | Flits rewards portal | `/account` sign-in stub | Click “My Rewards” |
| **P1** | `/pages/track-order` | Tracking UX | Tracktor on live (`/apps/tracktor/track`) | Email + UUID order ID (new orders only) + legacy link | Footer “Track an Order” |
| **P1** | `/account`, `/auth/*` | Customer account / rewards | Shopify customer + Flits | Firebase pages present; loyalty not implemented | Sign in / My Rewards (not fully tested without credentials) |
| **P2** | `/products/*` | “Notify me when available” | Back-in-stock (where configured) | Disabled button + placeholder copy | Find `comingSoon` SKU |
| **P2** | Global | Cookie bar | Visible until accepted | Implemented (`CookieConsent`); may be hidden if already accepted in browser | Clear `localStorage` key `totality-cookie-consent-v1` |
| **P2** | `/search?q=obagi` | — | Predictive Shopify search | Client-side `/search` works | Search “obagi” on both |

**Console / network (Vercel):** No application JS errors observed during audit. Octane quiz logs “Octane AI product quiz initiated” on `/pages/skin-care-quiz`. No failed asset requests noted on sampled PDPs.

**Slug note:** Live homepage links use `/products/obagi-clear` (not `obagi-nu-derm-clear-rx-2-0oz`). Vercel matches for sampled bestsellers (UPNEEQ, Cyspera, Obagi, Kenra, GlyMed).

---

## Major differences (feature gaps, content, UX)

### Header / navigation

| Area | Live | Vercel |
|------|------|--------|
| Logo | Image (CDN) | Text “Totality Skincare” |
| Primary nav | Skin Quiz, Shop (mega), Brands, About Us, Earn Rewards, My Account | Shop all, Brands, Concerns, Skin quiz, Blog, Track order, Contact, Sign in, **Legacy store** link |
| Shop submenu | Skin Quiz, Best Sellers, Skin Care, Hair Care, Makeup, Autumn Essentials | Not present (only “Shop all”) |
| Brands | Obagi, SkinCeuticals, Upneeq + “Show more” | Hover menu with 10 brands (Obagi, SkinCeuticals, UPNEEQ, EltaMD, etc.) |
| Rewards / subs | Earn Rewards, Manage Subscriptions | Wishlist; `/subscribe` linked from checkout only |
| Cart | Drawer + rewards login prompt | `/cart` page |

### Home page

| Section | Live | Vercel |
|---------|------|--------|
| Hero | Same headline intent; live also promotes quiz/brands in header area | Match Me + Shop all CTAs; no hero photography observed on Vercel |
| Best sellers | ~10 SKUs, qty selectors, back-in-stock notify on some | **Entire catalog** mislabeled “Our best sellers” |
| Shop by brands | Logo carousel (16 brands) | 14 logos + “Shop 30+ Brands” (3 brands exit to live Shopify) |
| Shop by concern | 6 concern tiles | 6 concern cards (internal routes) — **aligned** |
| Testimonials | Judge.me carousel with verified buyers + product links | 3 static quotes |
| Founder | Dr. Nadel copy | Present — **aligned in substance** |
| Promo | Free shipping strip | Free shipping + “Trusted by Dr. Nadel” — **aligned** |
| Sale strip | Store-driven promos | Generic “Sale · View offers in the shop” |

### Product detail (sampled)

| Product | Live URL | Vercel | Notes |
|---------|----------|--------|-------|
| Obagi Nu-Derm Clear RX | `/products/obagi-clear` | 200 OK | Price $135; Rx copy present on both |
| UPNEEQ 45 Day | `/products/upneeq-eyedrops-45-vials` | 200 OK | In Vercel cart during audit |
| Cyspera Intensive | `/products/scientis-cyspera-cysteamine-intensive-pigment-corrector` | 200 OK | |
| Amika (sample) | — | `/products/amikahair84` 200 OK | |
| Alastin (sample) | — | `/products/alastin-restorative-skin-complex` 200 OK | |

**Live-only PDP features:** review widgets, image gallery, social share, subscription radios, related products (“Complete your beauty routine”), breadcrumbs to Shopify collections.

**Vercel-only:** Rx badge, wishlist heart, “More Details” accordion (where HTML descriptions exist), recently-viewed tracker (localStorage).

### Cart & checkout

| Feature | Live | Vercel |
|---------|------|--------|
| Cart | Ajax drawer + rewards | Dedicated `/cart` with qty/remove — **functional** |
| Checkout | Shopify | Stripe UI **blocked** on preview |
| Free shipping message | $40+ | Shown on cart — **aligned** |
| Prescription | Shopify / app flow | Copy references manual capture; needs end-to-end test when Stripe live |

### Skin care quiz

| | Live | Vercel |
|---|------|--------|
| Route | `/pages/skin-care-quiz` | `/pages/skin-care-quiz` |
| Embed | Octane AI | Octane loads (“BEGIN”, welcome copy) — **aligned** |
| Fallback | — | Link to open quiz on live domain |

### Auth & account

| | Live | Vercel |
|---|------|--------|
| Login | Shopify customer | `/auth/login` (email + Google) |
| Account | Orders, rewards | `/account` prompts sign-in; no Flits |
| Signup | Shopify | `/auth/signup` |

### Static / content pages

| Page | Live | Vercel |
|------|------|--------|
| Contact | Shopify page | `/pages/contact` form — **present** |
| About / Proof / Gift cards / GovX / HIPAA | In About Us menu | Mostly external links to live Shopify or missing |
| Blog | `/blogs/news` content | Stub with link to live blog |
| Policies | Hosted on Shopify | Footer links to **live** policy URLs (intentional per `store.ts`) |
| Subscribe / boxes | Appstle / Flits | `/subscribe` page exists; not parity-tested |

### Search

- **Live:** Header modal “Search your Skincare” (Shopify).
- **Vercel:** Header modal + `/search?q=` — filters seeded catalog; Obagi search returns many Rx-tagged items — **works**.

### Mobile (390×844)

- Header collapses to hamburger; drawer includes Shop, Skin quiz, auth, brands list — **usable**.
- Home still injects full catalog in DOM — **critical mobile performance issue**.
- No horizontal overflow observed in accessibility snapshots on sampled pages.

---

## Minor / cosmetic

- Page title: live uses “Totality Medispa & Skincare”; Vercel uses “Totality Skincare | Medical-grade skincare”.
- Testimonials: generic names vs “Verified buyer” on live.
- Header includes visible “Legacy store” link (not on live).
- Newsletter / contact forms likely stubbed to API routes (not submitted during audit).
- Wishlist is localStorage-only (documented in `parity.ts`).
- Recently viewed section on home may add more cards if localStorage populated.

---

## Recommended fix order

1. **Fix `BestSellersSection`** — filter to curated homepage slugs (match live HTML: UPNEEQ 45-day, Cyspera, Obagi Clear, Kenra, GlyMed, etc.); add regression test or constant list.
2. **Configure Vercel env** — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Supabase service role + URL for checkout; smoke-test one non-Rx and one Rx cart.
3. **Paginate or virtualize** `/shop` and large collection pages; cap home sections.
4. **PDP phase 1** — image gallery, reviews (Judge.me embed or migration), subscription UI when Stripe Billing ready.
5. **Nav parity** — image logo, Shop mega-menu or equivalent collection landing pages, remove or gate “Legacy store” before cutover.
6. **Featured brands** — route FactorFive / Haleys / GLO to internal `/collections/brand/...` or fix slug mapping.
7. **Loyalty / track order** — Flits equivalent or clear “coming soon”; default footer track link to Tracktor until native tracking ships.
8. **Content** — blog migration, About Us pages on-domain, hosted policies when legal approves.

**Trivial critical fix (code):** In `src/components/home/product-grid.tsx`, replace `PRODUCTS.map` with a dedicated `BEST_SELLER_SLUGS` array (≈10 items). This is a one-line scope change with outsized impact.

---

## Pages / routes checked

| Route | Live | Vercel |
|-------|------|--------|
| `/` | ✅ | ✅ |
| `/shop` | ✅ (collections) | ✅ |
| `/cart` | ✅ drawer | ✅ |
| `/checkout` | ✅ | ✅ (blocked pay) |
| `/search` | ✅ modal | ✅ `?q=` |
| `/pages/skin-care-quiz` | ✅ | ✅ |
| `/pages/contact` | ✅ | ✅ |
| `/pages/track-order` | ✅ Tracktor | ✅ |
| `/auth/login` | ✅ | ✅ |
| `/auth/signup` | ✅ | ✅ |
| `/account` | ✅ | ✅ |
| `/wishlist` | N/A (Flits) | ✅ |
| `/blogs/news` | ✅ | ✅ stub |
| `/subscribe` | ✅ apps | ✅ |
| `/collections/brand/obagi` | ✅ | ✅ |
| `/collections/brand/amika` | ✅ | ✅ |
| `/collections/brand/alastin` | ✅ | ✅ |
| `/collections/concern/acne` | ✅ | ✅ |
| `/products/obagi-clear` | ✅ | ✅ |
| `/products/scientis-cyspera-cysteamine-intensive-pigment-corrector` | ✅ | ✅ |
| `/products/upneeq-eyedrops-45-vials` | ✅ | ✅ |
| `/products/amikahair84` | — | ✅ |
| `/products/alastin-restorative-skin-complex` | — | ✅ |
| Admin routes | not audited | not audited |

**Repo routes (public, from `src/app`):** `page.tsx`, `shop`, `cart`, `checkout`, `checkout/success`, `search`, `wishlist`, `subscribe`, `products/[slug]`, `collections/brand/[slug]`, `collections/concern/[slug]`, `pages/skin-care-quiz`, `pages/contact`, `pages/track-order`, `blogs/news`, `auth/login`, `auth/signup`, `account`, `orders/prescription`.

---

## Methodology

- Browser MCP: navigation, snapshots, console on Vercel; live comparison on desktop.
- HTTP HEAD checks for Vercel routes and sample PDP slugs.
- Live homepage HTML scrape for product URL slugs.
- Code cross-reference: `src/components/home/product-grid.tsx`, `src/config/parity.ts`, `src/config/store.ts`, `src/components/site-header.tsx`, `src/components/site-footer.tsx`.

---

*Generated for cutover planning; re-run after fixing bestseller filter and enabling Stripe on preview.*
