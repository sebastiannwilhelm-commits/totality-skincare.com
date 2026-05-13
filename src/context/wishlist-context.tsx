"use client";

import * as React from "react";

import { productBySlug } from "@/config/store";

const KEY = "totality-wishlist-v1";

type WishlistContextValue = {
  slugs: string[];
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  count: number;
};

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string" && productBySlug(s) !== undefined);
  } catch {
    return [];
  }
}

function write(next: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [slugs, setSlugs] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSlugs(read());
  }, []);

  const toggle = React.useCallback((slug: string) => {
    if (!productBySlug(slug)) return;
    setSlugs((cur) => {
      const has = cur.includes(slug);
      const next = has ? cur.filter((s) => s !== slug) : [...cur, slug];
      write(next);
      return next;
    });
  }, []);

  const has = React.useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const value = React.useMemo(
    () => ({
      slugs,
      toggle,
      has,
      count: slugs.length,
    }),
    [slugs, toggle, has],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
