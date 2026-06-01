import Link from "next/link";

import { isStripeSecretConfigured } from "@/lib/stripe/is-configured";
import { isSupabaseServiceConfiguredForCheckout } from "@/lib/supabase/checkout-server-env";

import { CheckoutClient } from "./checkout-client";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  const stripeConfigured = isStripeSecretConfigured();
  const supabaseForCartConfigured = isSupabaseServiceConfiguredForCheckout();
  const cartPayReady = stripeConfigured && supabaseForCartConfigured;

  return (
    <main className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {cartPayReady
          ? "Secure payment powered by Stripe Checkout."
          : "Secure payment powered by Stripe Checkout. Cart checkout stays disabled until both Stripe and Supabase server variables are set."}
      </p>
      <div className="mt-8">
        <CheckoutClient stripeConfigured={stripeConfigured} supabaseForCartConfigured={supabaseForCartConfigured} />
      </div>
      {!cartPayReady ? (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          Set Stripe and Supabase env vars on Vercel to enable payments. See{" "}
          <code className="text-xs">docs/vercel-env-setup.md</code> in the repo.
        </p>
      ) : null}
      <p className="mt-8 text-xs text-muted-foreground">
        <Link href="/subscribe" className="underline-offset-4 hover:underline">
          Prefer a monthly subscription box?
        </Link>
      </p>
    </main>
  );
}
