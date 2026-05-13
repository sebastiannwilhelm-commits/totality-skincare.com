"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import type { StoreProduct } from "@/lib/types";

export function ProductActions({ product }: { product: StoreProduct }) {
  const { add } = useCart();
  const [qty, setQty] = React.useState(1);

  if (product.comingSoon) {
    return (
      <div className="space-y-3">
        <Button type="button" variant="outline" className="w-full sm:w-auto" disabled>
          Notify me when available
        </Button>
        <p className="text-sm text-muted-foreground">
          We&apos;ll wire waitlist alerts to email/SMS when the communications layer is live.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Qty</span>
        <div className="mt-1 flex h-11 w-32 items-center justify-between rounded-md border bg-white">
          <button
            type="button"
            className="flex h-full w-10 items-center justify-center text-lg hover:bg-muted"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            −
          </button>
          <span className="text-sm font-semibold">{qty}</span>
          <button
            type="button"
            className="flex h-full w-10 items-center justify-center text-lg hover:bg-muted"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
        </div>
      </div>
      <Button type="button" variant="blush" className="h-11 sm:min-w-[12rem]" onClick={() => add(product.slug, qty)}>
        Add to cart
      </Button>
      <Button asChild variant="outline" className="h-11 sm:min-w-[10rem]">
        <Link href="/cart">View cart</Link>
      </Button>
    </div>
  );
}
