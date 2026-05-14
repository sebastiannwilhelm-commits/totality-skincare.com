"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

import { getFirebasePublicEnv } from "@/lib/firebase/public-env";

let appCache: FirebaseApp | null = null;
let authCache: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (authCache) return authCache;
  const env = getFirebasePublicEnv();
  if (!env) {
    throw new Error(
      "Missing NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, NEXT_PUBLIC_FIREBASE_PROJECT_ID, or NEXT_PUBLIC_FIREBASE_APP_ID",
    );
  }

  if (!appCache) {
    appCache = getApps().length > 0 ? getApp() : initializeApp(env);
  }
  authCache = getAuth(appCache);
  return authCache;
}
