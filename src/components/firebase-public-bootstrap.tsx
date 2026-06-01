"use client";

import * as React from "react";

import type { FirebasePublicEnv } from "@/lib/firebase/public-env";
import { setFirebasePublicRuntimeConfig } from "@/lib/firebase/runtime-public";

export function FirebasePublicBootstrap({ apiKey, authDomain, projectId, appId }: FirebasePublicEnv) {
  React.useLayoutEffect(() => {
    setFirebasePublicRuntimeConfig({ apiKey, authDomain, projectId, appId });
  }, [apiKey, authDomain, projectId, appId]);

  return null;
}
