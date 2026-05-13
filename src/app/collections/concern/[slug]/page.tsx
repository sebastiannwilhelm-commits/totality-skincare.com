import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/home/product-grid";
import { CONCERNS, productsByConcern } from "@/config/store";
import type { ConcernSlug } from "@/lib/types";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return CONCERNS.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: Props) {
  const c = CONCERNS.find((x) => x.slug === params.slug);
  return { title: c ? `Concern: ${c.label}` : "Concern" };
}

export default function ConcernCollectionPage({ params }: Props) {
  const valid = CONCERNS.some((c) => c.slug === params.slug);
  if (!valid) notFound();
  const concern = params.slug as ConcernSlug;
  const meta = CONCERNS.find((c) => c.slug === concern)!;
  const list = productsByConcern(concern);

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
      {list.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No products in this collection yet.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
