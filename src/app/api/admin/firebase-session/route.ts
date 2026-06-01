import { NextResponse } from "next/server";

import { isAllowlistedAdminEmail } from "@/lib/auth/admin-emails";
import { isAdminSessionSigningConfigured } from "@/lib/auth/admin-session-secret";
import { ADMIN_SESSION_COOKIE, signAdminSessionToken } from "@/lib/auth/admin-session-token";
import { verifyFirebaseIdToken } from "@/lib/auth/firebase-id-token";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "firebase_project_not_configured" }, { status: 503 });
  }
  if (!isAdminSessionSigningConfigured()) {
    return NextResponse.json({ error: "admin_session_secret_missing" }, { status: 503 });
  }

  let body: { idToken?: string };
  try {
    body = (await req.json()) as { idToken?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const idToken = typeof body.idToken === "string" ? body.idToken : "";
  if (!idToken) {
    return NextResponse.json({ error: "missing_id_token" }, { status: 400 });
  }

  let verified;
  try {
    verified = await verifyFirebaseIdToken(idToken, projectId);
  } catch {
    return NextResponse.json({ error: "invalid_id_token" }, { status: 401 });
  }

  if (!verified.email) {
    return NextResponse.json({ error: "email_required" }, { status: 403 });
  }
  if (verified.email_verified === false) {
    return NextResponse.json({ error: "email_not_verified" }, { status: 403 });
  }

  const emailLower = verified.email.trim().toLowerCase();
  if (!isAllowlistedAdminEmail(emailLower)) {
    return NextResponse.json({ error: "not_allowlisted_admin" }, { status: 403 });
  }

  const sessionJwt = await signAdminSessionToken(verified.sub, emailLower);
  if (!sessionJwt) {
    return NextResponse.json({ error: "could_not_sign_session" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, sessionJwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
