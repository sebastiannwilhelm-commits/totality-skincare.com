export const FIREBASE_PUBLIC_ENV_HELP =
  "Firebase Auth is not configured for this deployment. Add NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, and NEXT_PUBLIC_FIREBASE_APP_ID in Vercel (Production/Preview as needed), then redeploy.";

export const ADMIN_LOGIN_CONFIG_HELP =
  "Admin sign-in needs server env on Vercel: ADMIN_SESSION_SECRET (random 32+ chars) and ADMIN_EMAILS (comma-separated allowlist). After adding variables, redeploy, then sign in with an allowlisted email.";

/** Shown after Firebase sign-in when POST /api/admin/firebase-session returns admin_session_secret_missing. */
export const ADMIN_SESSION_SECRET_VERCEL_STEPS = [
  "Vercel → your project → Settings → Environment Variables (Production, and Preview if you use preview URLs).",
  "Add ADMIN_SESSION_SECRET — a long random string (32+ characters). Example: run openssl rand -hex 32 locally and paste the output.",
  "Add ADMIN_EMAILS=sebastian.n.wilhelm@gmail.com (comma-separated if you need more than one admin).",
  "Redeploy the project, then sign in again on this page.",
  "After a successful sign-in you will be sent to /admin.",
] as const;
