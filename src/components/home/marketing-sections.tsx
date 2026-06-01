import Image from "next/image";
import Link from "next/link";

import { FEATURED_BRANDS, featuredBrandHref } from "@/config/featured-brands";
import { CONCERNS } from "@/config/store";

export function ShopByBrandSection() {
  return (
    <section className="border-y bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Shop by brands
        </h2>
        <ul className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {FEATURED_BRANDS.map((b) => {
            const href = featuredBrandHref(b);
            const external = href.startsWith("http");
            return (
              <li key={b.slug} className="flex justify-center">
                <Link
                  href={href}
                  className="flex h-24 w-full max-w-[140px] items-center justify-center rounded-md border border-transparent p-3 transition hover:border-[hsl(350,40%,85%)] hover:bg-[hsl(350,85%,97%)]"
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  <Image
                    src={b.logoSrc}
                    alt={b.label}
                    width={140}
                    height={80}
                    className="h-auto max-h-16 w-auto object-contain"
                  />
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-10 text-center">
          <Link
            href="/shop"
            className="text-sm font-semibold uppercase tracking-wide text-[hsl(222,47%,18%)] underline-offset-4 hover:underline"
          >
            Shop 30+ Brands
          </Link>
        </p>
      </div>
    </section>
  );
}

export function ShopByConcernSection() {
  return (
    <section className="bg-[hsl(350,40%,98%)] py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Shop by concern
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCERNS.map((c) => (
            <Link
              key={c.slug}
              href={`/collections/concern/${c.slug}`}
              className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-[hsl(222,47%,18%)]">{c.label}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.blurb}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function TestimonialsSection() {
  const quotes = [
    {
      quote: "Finally a routine that feels medical-grade without the guesswork.",
      name: "Charleston customer",
    },
    {
      quote: "Shipping was quick and the Obagi products were exactly what my provider recommended.",
      name: "Verified buyer",
    },
    {
      quote: "Totality makes it easy to reorder what works for my skin.",
      name: "Repeat shopper",
    },
  ];
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          What our customers are saying
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-2xl font-serif font-medium leading-snug text-[hsl(222,47%,18%)]">
          Unlocking your true beauty
        </p>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {quotes.map((q) => (
            <blockquote
              key={q.name}
              className="rounded-lg border bg-white p-6 text-sm leading-relaxed text-muted-foreground shadow-sm"
            >
              <p>&ldquo;{q.quote}&rdquo;</p>
              <footer className="mt-4 text-xs font-semibold uppercase tracking-wide text-[hsl(222,47%,30%)]">
                {q.name}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FounderSection() {
  return (
    <section className="border-t bg-white py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Doctor founded &amp; approved
        </h2>
        <h3 className="mt-6 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Dr. Nicole Nadel</h3>
        <div className="mt-6 space-y-4 text-left text-sm leading-relaxed text-muted-foreground sm:text-base">
          <p>
            All of our items at Totality Skincare are personally selected by Dr. Nadel, DO, a
            distinguished and board-certified FACEP (Fellow of the American College of Emergency
            Physicians).
          </p>
          <p>
            She is the co-founder and Chief Medical Officer of Totality Skincare and Totality Medispa,
            an esteemed medical spa with two locations in Charleston, SC.
          </p>
          <p>
            Experience the power of medical-grade and prescription products, direct to you. Our
            one-stop-shop philosophy makes achieving radiant, flawless skin effortless.
          </p>
          <p className="text-center font-medium text-[hsl(222,47%,22%)]">Thank you for shopping with us!</p>
        </div>
      </div>
    </section>
  );
}
