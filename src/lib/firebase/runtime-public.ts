import type { FirebasePublicEnv } from "@/lib/firebase/public-env";

/** In-browser override when NEXT_PUBLIC_FIREBASE_* were not inlined at build time. */
let runtimePublic: FirebasePublicEnv | null = null;

export function getFirebasePublicRuntimeConfig(): FirebasePublicEnv | null {
  return runtimePublic;
}

export function setFirebasePublicRuntimeConfig(env: FirebasePublicEnv): void {
  const apiKey = env.apiKey?.trim();
  const authDomain = env.authDomain?.trim();
  const projectId = env.projectId?.trim();
  const appId = env.appId?.trim();
  if (!apiKey || !authDomain || !projectId || !appId) return;
  if (
    runtimePublic &&
    runtimePublic.apiKey === apiKey &&
    runtimePublic.authDomain === authDomain &&
    runtimePublic.projectId === projectId &&
    runtimePublic.appId === appId
  ) {
    return;
  }
  runtimePublic = { apiKey, authDomain, projectId, appId };
}
