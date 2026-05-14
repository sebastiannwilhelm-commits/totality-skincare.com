export type FirebasePublicEnv = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
};

/** Public Firebase web config used by browser auth/session state. */
export function getFirebasePublicEnv(): FirebasePublicEnv | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim();
  const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim();
  if (!apiKey || !authDomain || !projectId || !appId) return null;
  return { apiKey, authDomain, projectId, appId };
}

export function isFirebasePublicConfigured(): boolean {
  return getFirebasePublicEnv() !== null;
}
