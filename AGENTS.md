# AGENTS.md

## Cursor Cloud specific instructions

### Project overview

Next.js 14 (App Router) e-commerce storefront for Totality Skincare. Uses Supabase (auth + Postgres) and Stripe (checkout/webhooks). No monorepo — single `package.json` at the repo root.

### Standard commands

| Task | Command |
|------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (port 3000) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Production server | `npm run start` |

### Environment variables

Copy `.env.example` to `.env.local` and fill in values. The storefront **runs without** Stripe or Supabase: browse, cart, and static pages work. When public Supabase env is missing, `/account` and `/admin` show setup notices instead of 500 errors; `/auth/login` and `/auth/signup` disable the form and explain configuration. APIs that persist to the database return **503** with `error: "supabase_not_configured"` when the **service role** is missing (`POST /api/leads`, `POST /api/quiz/complete`).

Required for full functionality:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SUBSCRIPTION_PRICE_ID`

### Key gotchas

- **`createClientIfConfigured()`** (`src/lib/supabase/server.ts`) for server pages that should degrade gracefully; **`isSupabasePublicConfigured()`** / **`isSupabaseServiceConfigured()`** live in `src/lib/supabase/config.ts`.
- **Static product catalog.** Products are defined in `src/config/store.ts`, not fetched from Supabase. The cart context (`src/context/cart-context.tsx`) operates entirely client-side via localStorage.
- **Supabase migrations.** SQL migrations live in `supabase/migrations/`. These are applied via `supabase db push` (Supabase CLI) or manually in the Supabase SQL editor — they are NOT auto-applied on `npm run dev`.
- **No automated test suite.** There are no unit/integration tests in the repo. Validation is done via `npm run lint` and `npm run build` (TypeScript strict mode type checking).
