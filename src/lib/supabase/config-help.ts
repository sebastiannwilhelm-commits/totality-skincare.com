/** Shown when NEXT_PUBLIC_SUPABASE_* are missing on the host or in the client bundle. */
export const SUPABASE_PUBLIC_ENV_HELP =
  "Supabase is not configured for this deployment. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (Supabase Dashboard → Project Settings → API), in Vercel under Project → Settings → Environment Variables for Production (and Preview if you use it). Save, then redeploy so the browser bundle picks up NEXT_PUBLIC_* values. For local dev, copy .env.example to .env.local and fill both variables.";
