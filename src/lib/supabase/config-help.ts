/** Shown when NEXT_PUBLIC_SUPABASE_* are missing on the host or in the client bundle. */
export const SUPABASE_PUBLIC_ENV_HELP =
  "Supabase is not configured for this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase Dashboard → Project Settings → API), in Vercel under Project → Settings → Environment Variables for Production (and Preview if you use it). Save, then redeploy so the browser bundle picks up NEXT_PUBLIC_* values. For local dev, copy .env.example to .env.local and fill both variables.";

/** Shown when cart checkout API needs Supabase service env. */
export const SUPABASE_SERVER_CHECKOUT_ENV_HELP =
  "Checkout needs Supabase on the server: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (Dashboard → Settings → API). The storefront uses the service role only in trusted API routes such as creating a Stripe session.";
