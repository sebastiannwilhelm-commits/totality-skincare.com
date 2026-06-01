import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductActions } from "@/components/product-actions";
import { ProductDescription } from "@/components/product-description";
import { RecentlyViewedTracker } from "@/components/recently-viewed-tracker";
import { formatMoney, productBySlug, PRODUCTS } from "@/config/store";
import { productDescriptionHtml } from "@/lib/product-descriptions";

type Props = { params: { slug: string } };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props) {
  const p = productBySlug(params.slug);
  if (!p) return { title: "Product" };
  return { title: p.name, description: p.description };
}

export default function ProductPage({ params }: Props) {
  const p = productBySlug(params.slug);
  if (!p) notFound();
  const descriptionHtml = productDescriptionHtml(p.slug);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <RecentlyViewedTracker slug={p.slug} />
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:underline">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="line-clamp-1 text-foreground">{p.name}</span>
      </nav>
      <div className="mt-8 grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-square min-w-0 max-w-full overflow-hidden rounded-xl border bg-muted">
          <Image
            src={p.imageSrc}
            alt={p.name}
            fill
            className="object-contain p-4 sm:object-cover sm:p-0"
            priority
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-serif text-3xl font-semibold leading-tight text-[hsl(222,47%,18%)] sm:text-4xl">
            {p.name}
          </h1>
          <p className="mt-4 text-2xl font-semibold">{formatMoney(p.priceCents)}</p>
          {p.isPrescriptionRequired && !descriptionHtml ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
              This item may require a prescription or provider review. Checkout will collect intake
              details and hold fulfillment until authorized.
            </p>
          ) : null}
          {descriptionHtml ? (
            <ProductDescription html={descriptionHtml} />
          ) : (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          )}
          <div className="mt-8">
            <ProductActions product={p} />
          </div>
        </div>
      </div>
    </main>
  );
}
