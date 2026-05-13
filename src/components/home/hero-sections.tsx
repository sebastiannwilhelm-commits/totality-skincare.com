import Link from "next/link";

import { SITE, formatMoney } from "@/config/store";

import { Button } from "./ui/button";

export function PromoBar() {
  return (
    <div className="bg-[hsl(222,47%,18%)] px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
      <span className="opacity-90">Sale</span>
      <span className="mx-2 opacity-40">·</span>
      <Link href="/shop" className="underline-offset-2 hover:underline">
        View offers in the shop
      </Link>
    </div>
  );
}

export function TrustShippingStrip() {
  return (
    <div className="border-b bg-[hsl(350,85%,97%)] px-4 py-2.5">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-1 text-center text-xs text-[hsl(222,47%,22%)] sm:flex-row sm:gap-6 sm:text-sm">
        <p>
          <span className="font-semibold">Free Shipping</span> on orders{" "}
          {formatMoney(SITE.freeShippingMinCents)}+
        </p>
        <span className="hidden sm:inline opacity-30">|</span>
        <p>
          <span className="font-semibold">Trusted by Dr. Nadel</span>
        </p>
      </div>
    </div>
  );
}

export function HomeHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[hsl(350,85%,96%)] to-white">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(222,35%,40%)]">
          {SITE.tagline}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-tight tracking-tight text-[hsl(222,47%,14%)] sm:text-5xl">
          Your Home for Premium Medical-Grade Skincare
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Discover medical-grade products hand-selected for real results, so finding what your skin
          truly needs feels effortless.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild variant="blush" size="lg" className="text-base">
            <Link href="/pages/skin-care-quiz">Match Me With the Right Products</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-base">
            <Link href="/shop">Shop all</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
