"use client";

import * as React from "react";

import { ProductCard } from "@/components/home/product-grid";
import { productBySlug } from "@/config/store";
import { readRecentSlugs } from "@/lib/recently-viewed";

export function RecentlyViewedSection() {
  const [slugs, setSlugs] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSlugs(readRecentSlugs());
  }, []);

  const products = slugs
    .map((s) => productBySlug(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .slice(0, 8);

  if (products.length === 0) return null;

  return (
    <section className="border-y bg-white py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Recently viewed
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
          Mirrors the “recently viewed” experience from the live Shopify + Flits stack; stored on this
          device until you wire Supabase profiles.
        </p>
        <div className="mt-8 flex gap-4 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
          {products.map((p) => (
            <div key={p.slug} className="w-[min(100%,16rem)] shrink-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
