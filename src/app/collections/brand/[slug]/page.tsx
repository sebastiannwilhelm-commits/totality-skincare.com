import Link from "next/link";
import { notFound } from "next/navigation";

import { PaginatedProductListing } from "@/components/paginated-product-listing";
import { BRANDS, productsByBrand } from "@/config/store";
import { parsePageParam } from "@/lib/pagination";

type Props = { params: { slug: string }; searchParams: { page?: string } };

export function generateStaticParams() {
  return BRANDS.map((b) => ({ slug: b.slug }));
}

export function generateMetadata({ params }: Props) {
  const b = BRANDS.find((x) => x.slug === params.slug);
  return { title: b ? `Brand: ${b.label}` : "Brand" };
}

export default function BrandCollectionPage({ params, searchParams }: Props) {
  const meta = BRANDS.find((b) => b.slug === params.slug);
  if (!meta) notFound();
  const list = productsByBrand(params.slug);
  const page = parsePageParam(searchParams.page);
  const basePath = `/collections/brand/${params.slug}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{meta.label}</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">{meta.label}</h1>
      <PaginatedProductListing
        products={list}
        page={page}
        basePath={basePath}
        emptyMessage="No products for this brand in the seed catalog."
      />
    </main>
  );
}
