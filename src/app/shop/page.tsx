import Link from "next/link";

import { PaginatedProductListing } from "@/components/paginated-product-listing";
import { PRODUCTS, productsByProductType } from "@/config/store";
import { parsePageParam } from "@/lib/pagination";

export const metadata = {
  title: "Shop all",
};

type Props = {
  searchParams: { page?: string; type?: string };
};

export default function ShopPage({ searchParams }: Props) {
  const page = parsePageParam(searchParams.page);
  const type = searchParams.type?.toLowerCase();
  const list =
    type === "hair"
      ? productsByProductType("hair")
      : type === "makeup"
        ? productsByProductType("makeup")
        : PRODUCTS;

  const title =
    type === "hair" ? "Hair care" : type === "makeup" ? "Makeup" : "Shop all";

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Medical-grade catalog synced from the live storefront. Use pagination to browse the full
        collection.
      </p>
      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <Link
          href="/shop"
          className={
            !type
              ? "rounded-full bg-[hsl(222,47%,18%)] px-3 py-1 font-medium text-white"
              : "rounded-full border px-3 py-1 hover:bg-muted"
          }
        >
          All
        </Link>
        <Link
          href="/shop?type=hair"
          className={
            type === "hair"
              ? "rounded-full bg-[hsl(222,47%,18%)] px-3 py-1 font-medium text-white"
              : "rounded-full border px-3 py-1 hover:bg-muted"
          }
        >
          Hair care
        </Link>
        <Link
          href="/shop?type=makeup"
          className={
            type === "makeup"
              ? "rounded-full bg-[hsl(222,47%,18%)] px-3 py-1 font-medium text-white"
              : "rounded-full border px-3 py-1 hover:bg-muted"
          }
        >
          Makeup
        </Link>
      </div>
      <PaginatedProductListing
        products={list}
        page={page}
        basePath={type ? `/shop?type=${type}` : "/shop"}
      />
    </main>
  );
}
