"use client";

import type { StoreProduct } from "@/lib/types";
import { useCart } from "@/context/cart-context";

import { Button } from "@/components/ui/button";

export function ProductAddButton({ product }: { product: StoreProduct }) {
  const { add } = useCart();

  if (product.comingSoon) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled>
        Notify me when available
      </Button>
    );
  }

  return (
    <Button type="button" variant="blush" className="w-full" onClick={() => add(product.slug, 1)}>
      Add to cart
    </Button>
  );
}
