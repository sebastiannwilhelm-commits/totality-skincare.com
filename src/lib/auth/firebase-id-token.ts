import * as jose from "jose";

const FIREBASE_JWKS = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export type VerifiedFirebaseIdToken = {
  sub: string;
  email: string | undefined;
  email_verified: boolean | undefined;
};

/**
 * Verifies a Firebase Auth ID token (same rules as Firebase Admin verifyIdToken).
 * Uses public JWKS — no firebase-admin dependency.
 */
export async function verifyFirebaseIdToken(idToken: string, projectId: string): Promise<VerifiedFirebaseIdToken> {
  const { payload } = await jose.jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  const email = typeof payload.email === "string" ? payload.email : undefined;
  const email_verified = typeof payload.email_verified === "boolean" ? payload.email_verified : undefined;
  const sub = typeof payload.sub === "string" ? payload.sub : "";
  if (!sub) {
    throw new Error("invalid_firebase_token");
  }
  return { sub, email, email_verified };
}
