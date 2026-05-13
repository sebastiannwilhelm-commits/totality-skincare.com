"use client";

import Link from "next/link";

import { ProductCard } from "@/components/home/product-grid";
import { productBySlug } from "@/config/store";
import { useWishlist } from "@/context/wishlist-context";
import type { StoreProduct } from "@/lib/types";

export function WishlistClient() {
  const { slugs } = useWishlist();
  const products = slugs
    .map((s) => productBySlug(s))
    .filter((p): p is StoreProduct => Boolean(p));

  if (products.length === 0) {
    return (
      <p className="mt-6 text-muted-foreground">
        Your wishlist is empty. Tap the heart on any product card to save it.{" "}
        <Link href="/shop" className="font-medium text-foreground underline-offset-4 hover:underline">
          Browse the shop
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
