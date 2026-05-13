import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Checkout" };

export default function CheckoutPlaceholderPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Checkout</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Stripe Checkout, live Shippo rates, and prescription capture will land in Phase 2. Until then,
        you can complete purchases on the{" "}
        <a
          href="https://totality-skincare.com"
          className="font-medium text-foreground underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          live Shopify store
        </a>
        .
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="blush">
          <Link href="/cart">Back to cart</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/shop">Continue shopping</Link>
        </Button>
      </div>
    </main>
  );
}
