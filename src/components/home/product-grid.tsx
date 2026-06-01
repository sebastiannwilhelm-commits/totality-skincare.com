import Image from "next/image";
import Link from "next/link";

import { bestSellerProducts, formatMoney } from "@/config/store";
import type { StoreProduct } from "@/lib/types";

import { WishlistHeartButton } from "@/components/wishlist-heart-button";

import { ProductAddButton } from "./product-add-button";

export function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition hover:shadow-md">
      <Link href={`/products/${product.slug}`} className="relative aspect-square bg-muted">
        <Image
          src={product.imageSrc}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes="(max-width:768px) 50vw, 25vw"
        />
        {product.isPrescriptionRequired ? (
          <span className="absolute left-2 top-2 rounded bg-[hsl(222,47%,18%)]/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            Rx review
          </span>
        ) : null}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/products/${product.slug}`} className="font-medium leading-snug hover:underline">
          {product.name}
        </Link>
        <p className="mt-2 text-sm font-semibold">{formatMoney(product.priceCents)}</p>
        <div className="mt-4 flex gap-2">
          <div className="min-w-0 flex-1">
            <ProductAddButton product={product} />
          </div>
          <WishlistHeartButton slug={product.slug} className="h-10 w-10" />
        </div>
      </div>
    </article>
  );
}

export function BestSellersSection() {
  const products = bestSellerProducts();

  return (
    <section id="best-sellers" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Our best sellers
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
