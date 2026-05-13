import Link from "next/link";

import { ProductCard } from "@/components/home/product-grid";
import { PRODUCTS } from "@/config/store";

export const metadata = {
  title: "Search",
};

function normalizeQ(q: string | string[] | undefined): string {
  if (Array.isArray(q)) return (q[0] ?? "").trim().toLowerCase();
  return (q ?? "").trim().toLowerCase();
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = normalizeQ(searchParams.q);
  const results = !q
    ? []
    : PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.concerns.some((c) => c.includes(q)),
      );

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Search</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Search</h1>
      {!q ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Enter a search query, for example{" "}
          <Link className="underline-offset-4 hover:underline" href="/search?q=obagi">
            /search?q=obagi
          </Link>
          .
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm text-muted-foreground">
            Results for <span className="font-medium text-foreground">&ldquo;{q}&rdquo;</span> ({results.length})
          </p>
          {results.length === 0 ? (
            <p className="mt-8 text-sm text-muted-foreground">No products match that query.</p>
          ) : (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
