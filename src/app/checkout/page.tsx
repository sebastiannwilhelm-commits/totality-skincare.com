import Link from "next/link";

import { isStripeSecretConfigured } from "@/lib/stripe/is-configured";

import { CheckoutClient } from "./checkout-client";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  const stripeConfigured = isStripeSecretConfigured();

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {stripeConfigured
          ? "Secure payment powered by Stripe Checkout."
          : "Secure payment powered by Stripe Checkout. Payment is disabled until Stripe is configured on the server."}
      </p>
      <div className="mt-8">
        <CheckoutClient stripeConfigured={stripeConfigured} />
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        <Link href="/subscribe" className="underline-offset-4 hover:underline">
          Prefer a monthly subscription box?
        </Link>
      </p>
    </main>
  );
}
