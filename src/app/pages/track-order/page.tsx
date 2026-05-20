import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE } from "@/config/store";

import { TrackOrderAuthActions } from "./track-order-auth-actions";
import { TrackOrderLookup } from "./track-order-lookup";

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
        Look up orders placed on this storefront by email and order ID. Legacy Shopify orders can still use the
        Tracktor link below.
      </p>
      <TrackOrderLookup />
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline" size="lg">
          <a href={SITE.legacyOrderTrackingUrl} target="_blank" rel="noreferrer">
            Legacy Shopify tracking
          </a>
        </Button>
      </div>
      <TrackOrderAuthActions />
    </main>
  );
}
