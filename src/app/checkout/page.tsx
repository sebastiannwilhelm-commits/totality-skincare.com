import Link from "next/link";

import { CheckoutClient } from "./checkout-client";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Secure payment powered by Stripe Checkout. Configure{" "}
        <code className="rounded bg-muted px-1 text-xs">STRIPE_SECRET_KEY</code> and webhook in your env.
      </p>
      <div className="mt-8">
        <CheckoutClient />
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        <Link href="/subscribe" className="underline-offset-4 hover:underline">
          Prefer a monthly subscription box?
        </Link>
      </p>
    </main>
  );
}
