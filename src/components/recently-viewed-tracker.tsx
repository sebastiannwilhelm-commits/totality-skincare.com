"use client";

import * as React from "react";

import { touchRecentSlug } from "@/lib/recently-viewed";

export function RecentlyViewedTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    touchRecentSlug(slug);
  }, [slug]);
  return null;
}
