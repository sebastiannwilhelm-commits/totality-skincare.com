"use client";

import * as React from "react";

import { productBySlug } from "@/config/store";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "totality-storefront-cart-v1";

type CartContextValue = {
  lines: CartLine[];
  add: (slug: string, qty?: number) => void;
  setQty: (slug: string, qty: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = React.createContext<CartContextValue | null>(null);

function readLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l) =>
        l &&
        typeof l.slug === "string" &&
        typeof l.quantity === "number" &&
        l.quantity > 0 &&
        productBySlug(l.slug),
    );
  } catch {
    return [];
  }
}

function writeLines(next: CartLine[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore quota */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = React.useState<CartLine[]>([]);

  React.useEffect(() => {
    setLines(readLines());
  }, []);

  const add = React.useCallback((slug: string, qty = 1) => {
    setLines((cur) => {
      const p = productBySlug(slug);
      if (!p || p.comingSoon) return cur;
      const idx = cur.findIndex((l) => l.slug === slug);
      let next: CartLine[];
      if (idx === -1) next = [...cur, { slug, quantity: qty }];
      else {
        next = [...cur];
        next[idx] = { slug, quantity: next[idx].quantity + qty };
      }
      writeLines(next);
      return next;
    });
  }, []);

  const setQty = React.useCallback((slug: string, qty: number) => {
    setLines((cur) => {
      let next: CartLine[];
      if (qty < 1) next = cur.filter((l) => l.slug !== slug);
      else {
        const idx = cur.findIndex((l) => l.slug === slug);
        if (idx === -1) return cur;
        next = [...cur];
        next[idx] = { slug, quantity: qty };
      }
      writeLines(next);
      return next;
    });
  }, []);

  const remove = React.useCallback((slug: string) => {
    setLines((cur) => {
      const next = cur.filter((l) => l.slug !== slug);
      writeLines(next);
      return next;
    });
  }, []);

  const clear = React.useCallback(() => {
    writeLines([]);
    setLines([]);
  }, []);

  const count = React.useMemo(
    () => lines.reduce((acc, l) => acc + l.quantity, 0),
    [lines],
  );

  const value = React.useMemo(
    () => ({ lines, add, setQty, remove, clear, count }),
    [lines, add, setQty, remove, clear, count],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
