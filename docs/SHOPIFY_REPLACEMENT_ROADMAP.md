# Totality Skincare — Shopify Replacement Roadmap

Custom storefront replacing [totality-skincare.com](https://totality-skincare.com) on **Next.js 14 + Supabase + Stripe + Firebase Auth**, with operational tooling in `/admin`.

**Audit date:** 2026-05-19  
**Repo:** `palmetto-developments-storefront`

---

## Executive summary

The storefront **marketing layer and catalog** are largely built (Shopify-derived static catalog, browse, cart, Stripe Checkout). **Commerce operations** (product admin, order desk, Rx workflow UI, shipping labels, notifications, real analytics) are mostly **schema-first** with partial backend wiring. Recommended baseline: **keep the current stack**; add Shippo (multi-carrier labels), Resend, and Twilio in later phases as already stubbed in `.env.example`.

---

## Feature audit (9 areas)

| # | Area | Status | What exists | Gaps |
|---|------|--------|-------------|------|
| 1 | **Product management** | 🟡 Partial | Static catalog: `src/config/catalog-products.ts` (generated via `scripts/generate-catalog.mjs`), PDP `src/app/products/[slug]/page.tsx`, images from `imageSrc` in config. DB: `public.products` with price, description, `inventory_count`, `is_prescription_required` — seeded in `supabase/migrations/20250513140001_seed_catalog_products.sql`. Checkout reads DB prices by slug (`src/app/api/checkout/create-session/route.ts`). | No admin CRUD UI; no `product_images` table or Supabase Storage uploads; catalog edits require regen script + redeploy; DB and static catalog can drift. |
| 2 | **Shopping cart & checkout** | 🟡 Partial | Client cart: `src/context/cart-context.tsx`, `src/app/cart/page.tsx`, `src/app/checkout/checkout-client.tsx` → `POST /api/checkout/create-session`. Stripe Checkout + Rx manual capture when cart has Rx SKUs. Webhook creates orders: `src/app/api/webhooks/stripe/route.ts`. Success: `src/app/checkout/success/page.tsx`. Subscriptions: `src/app/subscribe/page.tsx`. | No server-side cart; prices on cart UI use static config not live DB; no tax/shipping line items in Stripe session; inventory not decremented on purchase. |
| 3 | **Prescription form & Nicole workflow** | 🟡 Partial | Schema: `public.prescriptions`, `orders.status` includes `pending_approval` / `authorized` (`supabase/migrations/20250512120000_initial_storefront_schema.sql`). Checkout sets `capture_method: manual` and `requires_rx` metadata (`create-session/route.ts`). Webhook inserts placeholder `prescriptions` row (`webhooks/stripe/route.ts`). PDP copy for Rx items. | **No post-checkout intake form**; **no admin approve/deny UI**; no Stripe capture on approve; no Nicole signature upload. |
| 4 | **Order management** | 🟡 Partial | Orders + `order_items` tables; webhook populates on `checkout.session.completed`; admin audit table `checkout_sessions`; read-only list: `src/app/admin/orders/page.tsx` (new). Checkouts mirror: `src/app/admin/checkouts/page.tsx`. RLS admin policies: `supabase/migrations/20250513140002_admin_read_policies.sql`. | No order detail page, status transitions, refunds, or line-item editor; Firebase admin uses service role (not Supabase `admin_roles` RLS). |
| 5 | **Shipping labels** | ❌ Missing | DB columns: `shipping_label_url`, `tracking_number`, `shipping_carrier`, `shippo_rate_id`, `shippo_transaction_id` on `orders`. `SHIPPO_API_KEY` in `.env.example`. Track-order page notes future Shippo (`src/app/pages/track-order/page.tsx`). | No Shippo API routes, no label print UI, no carrier selection (FedEx/UPS/USPS via Shippo). |
| 6 | **Inventory** | 🟡 Partial | `products.inventory_count` in DB; seed uses placeholder `99`; `comingSoon` in static catalog when live inventory is 0 (`src/lib/types.ts`). | No decrement on order; no admin adjust UI; no low-stock alerts or email. |
| 7 | **Customer management** | 🟡 Partial | `public.customers` (+ `stripe_customer_id`); webhook `ensureCustomer`; loyalty tables; `customer_order_history` view. Account: `src/app/account/page.tsx` (Firebase sign-in only, no order history). Billing portal: `src/app/api/billing/portal/route.ts`. | No link Firebase UID ↔ `customers.user_id`; no admin customer list/notes (`notes` only on `prescriptions` today); no CRM notes table. |
| 8 | **Email & SMS after purchase** | ❌ Missing | Env placeholders: `RESEND_*`, `TWILIO_*` in `.env.example`. Newsletter/contact persist to `leads` only (`src/app/api/newsletter/route.ts`, `src/app/api/contact/route.ts`). | No order confirmation, shipping, or Rx-status emails/SMS; no Resend/Twilio SDK usage. |
| 9 | **Analytics** | 🟡 Partial | Admin counts: `src/app/admin/page.tsx`, 7-day funnel `src/app/admin/analytics/page.tsx` (leads, quiz, order **counts** only). | No revenue charts, top products, conversion, or date-range dashboards. |

**Legend:** ✅ exists · 🟡 partial · ❌ missing

---

## Architecture recommendation

### Keep (baseline)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| App | **Next.js 14** App Router | Already deployed pattern; RSC admin + API routes. |
| Database | **Supabase Postgres** | Orders, products, Rx, RLS, migrations in repo. |
| Payments | **Stripe Checkout + webhooks** | Working path; manual capture for Rx. |
| Storefront auth | **Firebase Auth** | Login/signup/account implemented. |
| Admin auth | **Supabase Auth `admin_roles` OR `ADMIN_EMAILS` + Firebase session cookie** | `src/lib/auth/admin.ts`, `POST /api/admin/firebase-session`. |
| Catalog (interim) | **Generated TS catalog + DB sync for checkout** | Fine until admin product UI ships. |

### Add (incremental)

- **Supabase Storage** — product images, Rx signatures, label PDFs.
- **Shippo** — one API for USPS/UPS/FedEx labels (columns already on `orders`).
- **Resend** — transactional email (confirmations, shipping, Rx status).
- **Twilio** — SMS for shipping/Rx updates (optional parity with Shopify SMS apps).
- **Optional later:** link Firebase `uid` to `customers.user_id` on first order; or consolidate on Supabase Auth for customers if dual-auth cost is too high.

### Do not change without strong reason

- Moving off Stripe for payments.
- Replacing Supabase for orders/Rx (schema is already tailored).
- Rebuilding catalog as headless Shopify (goal is leave Shopify).

---

## Phased roadmap

### Phase 0 — Production-ready checkout (1–2 weeks)

**Goal:** Money path reliable on custom domain.

- [ ] Production env on Vercel (see [Environment variables](#environment-variables)).
- [ ] Run all Supabase migrations on production project.
- [ ] Stripe webhook → `/api/webhooks/stripe` (live mode signing secret).
- [ ] Smoke test: cart → pay → order row + `order_items` in Supabase.
- [ ] Align static catalog with DB (run seed migration or sync job after catalog changes).
- [ ] DNS cutover plan (parallel run with Shopify until sign-off).

**Depends on:** nothing. **Business value:** revenue.

---

### Phase 1 — Order desk & account truth (2–3 weeks)

**Goal:** Staff can see and update orders; customers see their purchases.

- [ ] Admin order detail: status, addresses, line items, Stripe payment intent link.
- [ ] Status workflow: `paid` → `shipped` / `cancelled` / `refunded` (manual first).
- [ ] Link checkout email to Firebase account (create/update `customers` on login).
- [ ] Account page: order list from Supabase (service or RLS via linked `user_id`).
- [ ] Fix admin “Orders” card to point to `/admin/orders` (not analytics only).

**Depends on:** Phase 0. **Business value:** replaces Shopify admin order list.

---

### Phase 2 — Prescription workflow (2–4 weeks)

**Goal:** Post-order Rx intake + Nicole approval replaces Shopify + manual process.

- [ ] Post-checkout intake form (`/orders/[id]/prescription` or magic link from email).
- [ ] Admin queue: `pending_approval` orders + `prescriptions` table.
- [ ] Nicole UI: review intake, approve/deny, capture signature → Storage URL.
- [ ] On approve: Stripe `paymentIntents.capture`, set `orders.status = authorized`, `prescriptions.authorized_by_nicole`.
- [ ] On deny: cancel intent / refund path + customer notification.

**Depends on:** Phase 1. **Business value:** legal/compliance for Rx SKUs (UPNEEQ, Obagi Rx, etc.).

---

### Phase 3 — Fulfillment & notifications (2–3 weeks)

**Goal:** Ship and communicate like Shopify + apps.

- [ ] Shippo: rates at checkout or flat rate + label purchase in admin.
- [ ] Write `tracking_number`, `shipping_label_url`, set `status = shipped`.
- [ ] Resend: order confirmation, shipped, Rx approved/denied templates.
- [ ] Twilio SMS (optional): shipped + Rx status.
- [ ] Native track-order page (replace legacy Tracktor link in `src/config/store.ts`).

**Depends on:** Phase 1–2 for Rx gating before ship. **Business value:** ops time savings.

---

### Phase 4 — Merchandising, inventory, analytics (ongoing)

**Goal:** Shopify-like merchandising without Shopify bill.

- [ ] Admin product CRUD (name, price, description, images, Rx flag, inventory).
- [ ] Decrement inventory on paid/captured orders; low-stock admin alert.
- [ ] Analytics dashboard: revenue, AOV, top SKUs, funnel (leads → quiz → checkout → order).
- [ ] Customer admin: profile, notes, order history.
- [ ] Deprecate `generate-catalog.mjs` or run it only as import from admin.

**Depends on:** stable orders from Phase 0–1. **Business value:** merchandising autonomy.

---

## Parity reference

Shopify-facing parity checklist lives in `src/config/parity.ts` (`TOT_SKINCARE_PARITY`). Use alongside this doc for **marketing** features (quiz, wishlist, blog, etc.).

---

## Environment variables

Copy `.env.example` → `.env.local` (dev) and set in **Vercel → Production** (and Preview if needed).

### Required for live cart + orders

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Canonical origin (metadata, redirects) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser + RSC anon client |
| `SUPABASE_SERVICE_ROLE_KEY` | Checkout API, webhooks, admin data, lead inserts |
| `STRIPE_SECRET_KEY` | Checkout sessions + webhook |
| `STRIPE_WEBHOOK_SECRET` | Verify `POST /api/webhooks/stripe` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Storefront login |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Auth |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Auth |

### Required for admin (pick one path)

| Variable | Purpose |
|----------|---------|
| `ADMIN_EMAILS` | Comma-separated Firebase emails allowed into `/admin` |
| `ADMIN_SESSION_SECRET` | Signs httpOnly cookie after Firebase sign-in |
| — *or* — | Grant `admin_roles` row for Supabase Auth user (no extra env beyond Supabase) |

### Optional / phase-specific

| Variable | Phase | Purpose |
|----------|-------|---------|
| `STRIPE_SUBSCRIPTION_PRICE_ID` | Subscriptions | `/subscribe` club checkout |
| `RESEND_API_KEY` | 3 | Transactional email |
| `TWILIO_ACCOUNT_SID` | 3 | SMS |
| `TWILIO_AUTH_TOKEN` | 3 | SMS |
| `TWILIO_MESSAGING_SERVICE_SID` | 3 | SMS sender |
| `SHIPPO_API_KEY` | 3 | Multi-carrier labels |

### Supabase Dashboard (not env vars)

- **Authentication → URL Configuration:** Site URL + redirect allowlist including `/auth/callback`.
- **SQL:** `insert into public.admin_roles (user_id) values ('<uuid>');` for Supabase-auth admins.

---

## Key file index

| Concern | Paths |
|---------|--------|
| Store config | `src/config/store.ts`, `src/config/catalog-products.ts` |
| Cart / checkout | `src/context/cart-context.tsx`, `src/app/checkout/*`, `src/app/api/checkout/create-session/route.ts` |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts` |
| Admin shell | `src/app/admin/layout.tsx`, `src/lib/auth/admin.ts` |
| Schema | `supabase/migrations/*.sql` |
| Env template | `.env.example` |

---

## Quick wins shipped with this doc

- This roadmap (`docs/SHOPIFY_REPLACEMENT_ROADMAP.md`).
- Admin nav + read-only **Orders** list at `/admin/orders` (service-role query).
