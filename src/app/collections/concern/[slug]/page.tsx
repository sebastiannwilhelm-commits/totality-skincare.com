import Link from "next/link";
import { notFound } from "next/navigation";

import { PaginatedProductListing } from "@/components/paginated-product-listing";
import { CONCERNS, productsByConcern } from "@/config/store";
import { parsePageParam } from "@/lib/pagination";
import type { ConcernSlug } from "@/lib/types";

type Props = { params: { slug: string }; searchParams: { page?: string } };

export function generateStaticParams() {
  return CONCERNS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props) {
  const c = CONCERNS.find((x) => x.slug === params.slug);
  return { title: c ? `Concern: ${c.label}` : "Concern" };
}

export default function ConcernCollectionPage({ params, searchParams }: Props) {
  const valid = CONCERNS.some((c) => c.slug === params.slug);
  if (!valid) notFound();
  const concern = params.slug as ConcernSlug;
  const meta = CONCERNS.find((c) => c.slug === concern)!;
  const list = productsByConcern(concern);
  const page = parsePageParam(searchParams.page);
  const basePath = `/collections/concern/${params.slug}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{meta.label}</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Shop by concern: {meta.label}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{meta.blurb}</p>
      <PaginatedProductListing
        products={list}
        page={page}
        basePath={basePath}
        emptyMessage="No products in this collection yet."
      />
    </main>
  );
}
