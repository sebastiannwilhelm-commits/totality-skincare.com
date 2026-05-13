import Link from "next/link";

import { ProductCard } from "@/components/home/product-grid";
import { PRODUCTS } from "@/config/store";

export const metadata = {
  title: "Shop all",
};

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Shop</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Shop all</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Catalog mirrors the live storefront bestsellers and navigation; inventory and checkout move
        to Supabase + Stripe per your rollout plan.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </main>
  );
}
