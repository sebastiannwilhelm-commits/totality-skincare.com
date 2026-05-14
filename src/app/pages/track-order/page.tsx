import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE } from "@/config/store";

import { TrackOrderAuthActions } from "./track-order-auth-actions";

export const metadata = {
  title: "Track order",
  description: "Track your Totality Skincare shipment.",
};

export default function TrackOrderPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Track order</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Track your order</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The live store uses Shopify&apos;s Tracktor app at the same URL pattern customers already
        expect. After Shippo + your order model ship, this page can accept an order token and show
        native tracking.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="blush" size="lg">
          <a href={SITE.legacyOrderTrackingUrl} target="_blank" rel="noreferrer">
            Open order tracking (Shopify)
          </a>
        </Button>
      </div>
      <TrackOrderAuthActions />
    </main>
  );
}
