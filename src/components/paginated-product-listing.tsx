import Link from "next/link";

import { ProductCard } from "@/components/home/product-grid";
import { buildPageUrl, paginate, PRODUCTS_PER_PAGE } from "@/lib/pagination";
import type { StoreProduct } from "@/lib/types";

type Props = {
  products: StoreProduct[];
  page: number;
  basePath: string;
  emptyMessage?: string;
};

export function PaginatedProductListing({ products, page, basePath, emptyMessage }: Props) {
  const { items, totalPages, total, page: safePage } = paginate(products, page);

  if (total === 0) {
    return (
      <p className="mt-10 text-sm text-muted-foreground">
        {emptyMessage ?? "No products found."}
      </p>
    );
  }

  const pageHref = (p: number) => buildPageUrl(basePath, p);

  return (
    <>
      <p className="mt-4 text-sm text-muted-foreground">
        Showing {(safePage - 1) * PRODUCTS_PER_PAGE + 1}–
        {Math.min(safePage * PRODUCTS_PER_PAGE, total)} of {total} products
      </p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      {totalPages > 1 ? (
        <nav
          className="mt-12 flex flex-wrap items-center justify-center gap-2"
          aria-label="Product pagination"
        >
          {safePage > 1 ? (
            <Link
              href={pageHref(safePage - 1)}
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Previous
            </Link>
          ) : null}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
            .map((p, idx, arr) => {
              const prev = arr[idx - 1];
              const showEllipsis = prev !== undefined && p - prev > 1;
              return (
                <span key={p} className="flex items-center gap-2">
                  {showEllipsis ? <span className="px-1 text-muted-foreground">…</span> : null}
                  <Link
                    href={pageHref(p)}
                    aria-current={p === safePage ? "page" : undefined}
                    className={
                      p === safePage
                        ? "rounded-md bg-[hsl(222,47%,18%)] px-3 py-2 text-sm font-medium text-white"
                        : "rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
                    }
                  >
                    {p}
                  </Link>
                </span>
              );
            })}
          {safePage < totalPages ? (
            <Link
              href={pageHref(safePage + 1)}
              className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
