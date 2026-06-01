import * as jose from "jose";

import { getAdminSessionSigningMaterial } from "@/lib/auth/admin-session-secret";

export const ADMIN_SESSION_COOKIE = "pd_admin_session";

function getSecretKey(): Uint8Array | null {
  const s = getAdminSessionSigningMaterial();
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function signAdminSessionToken(firebaseUid: string, emailLower: string): Promise<string | null> {
  const key = getSecretKey();
  if (!key) return null;
  return new jose.SignJWT({ email: emailLower })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(firebaseUid)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAdminSessionToken(token: string): Promise<{ uid: string; email: string } | null> {
  const key = getSecretKey();
  if (!key) return null;
  try {
    const { payload } = await jose.jwtVerify(token, key, { algorithms: ["HS256"] });
    const uid = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!uid || !email) return null;
    return { uid, email: email.toLowerCase() };
  } catch {
    return null;
  }
}
