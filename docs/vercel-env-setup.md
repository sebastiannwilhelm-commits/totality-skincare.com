# Vercel environment variables

Cart checkout on the preview deployment stays disabled until **both** Stripe and Supabase server variables are set in the Vercel project.

## Required for checkout (P0)

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Create Stripe Checkout sessions |
| `STRIPE_WEBHOOK_SECRET` | Confirm paid orders via webhook |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Persist orders server-side at checkout |

Copy names from `.env.example` in the repo root. After adding variables, redeploy and smoke-test `/checkout` with a non-Rx SKU.

## Optional / auth

Firebase and Google sign-in variables are documented in `.env.example` for `/auth/login` and `/account`.

## Verify

1. Add item on Vercel → `/cart` → `/checkout`
2. “Pay securely with Stripe” should be enabled
3. Complete a test payment in Stripe test mode
