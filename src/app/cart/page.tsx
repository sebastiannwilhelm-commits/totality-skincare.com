"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatMoney, productBySlug } from "@/config/store";
import { useCart } from "@/context/cart-context";

export default function CartPage() {
  const { lines, setQty, remove } = useCart();

  const rows = lines
    .map((l) => {
      const p = productBySlug(l.slug);
      return p ? { line: l, product: p } : null;
    })
    .filter(Boolean) as { line: { slug: string; quantity: number }; product: NonNullable<ReturnType<typeof productBySlug>> }[];

  const subtotal = rows.reduce((acc, { line, product }) => acc + product.priceCents * line.quantity, 0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Cart</h1>
      {rows.length === 0 ? (
        <p className="mt-6 text-muted-foreground">
          Your cart is empty.{" "}
          <Link href="/shop" className="font-medium text-foreground underline-offset-4 hover:underline">
            Browse the shop
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 divide-y">
          {rows.map(({ line, product }) => (
            <li key={line.slug} className="flex gap-4 py-6">
              <Link href={`/products/${product.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md border bg-muted">
                <Image src={product.imageSrc} alt={product.name} fill className="object-cover" sizes="96px" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${product.slug}`} className="font-medium hover:underline">
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">{formatMoney(product.priceCents)} each</p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <div className="flex h-9 w-28 items-center justify-between rounded-md border bg-white text-sm">
                    <button
                      type="button"
                      className="flex h-full w-8 items-center justify-center hover:bg-muted"
                      onClick={() => setQty(line.slug, line.quantity - 1)}
                    >
                      −
                    </button>
                    <span className="font-medium">{line.quantity}</span>
                    <button
                      type="button"
                      className="flex h-full w-8 items-center justify-center hover:bg-muted"
                      onClick={() => setQty(line.slug, line.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <button type="button" className="text-sm text-destructive hover:underline" onClick={() => remove(line.slug)}>
                    Remove
                  </button>
                </div>
              </div>
              <div className="text-right text-sm font-semibold">
                {formatMoney(product.priceCents * line.quantity)}
              </div>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 0 ? (
        <div className="mt-8 border-t pt-6">
          <div className="flex justify-between text-base font-semibold">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
          <Button asChild className="mt-6 w-full sm:w-auto" variant="navy" size="lg">
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      ) : null}
    </main>
  );
}
