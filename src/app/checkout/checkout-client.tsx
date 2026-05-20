"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatMoney, SITE } from "@/config/store";
import { STRIPE_SERVER_CHECKOUT_ENV_HELP } from "@/lib/stripe/config-help";
import { SUPABASE_SERVER_CHECKOUT_ENV_HELP } from "@/lib/supabase/config-help";

function mapCheckoutErrorMessage(code: string | undefined, slug?: string): string {
  if (code === "stripe_not_configured") return STRIPE_SERVER_CHECKOUT_ENV_HELP;
  if (code === "supabase_not_configured") return SUPABASE_SERVER_CHECKOUT_ENV_HELP;
  if (code === "out_of_stock") return slug ? `“${slug}” is out of stock.` : "An item in your cart is out of stock.";
  return code ?? "checkout_failed";
}

type CheckoutClientProps = {
  /** From the server: Stripe secret key is set for API routes (never exposed to the client). */
  stripeConfigured: boolean;
  /** Supabase URL + service role set so `/api/checkout/create-session` can load product rows. */
  supabaseForCartConfigured: boolean;
};

export function CheckoutClient({ stripeConfigured, supabaseForCartConfigured }: CheckoutClientProps) {
  const { lines, count } = useCart();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [stripeErr, setStripeErr] = React.useState<string | null>(null);

  const cartPayReady = stripeConfigured && supabaseForCartConfigured;

  async function pay() {
    if (!cartPayReady) return;
    setErr(null);
    setStripeErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customer_email: email || undefined,
          mode: "payment",
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string; slug?: string };
      if (!res.ok) {
        const raw = data.error ?? "checkout_failed";
        if (raw === "stripe_not_configured" || raw === "supabase_not_configured") {
          setStripeErr(mapCheckoutErrorMessage(raw));
        } else {
          setErr(mapCheckoutErrorMessage(raw, data.slug));
        }
        return;
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr("no_checkout_url");
    } catch {
      setErr("network");
    } finally {
      setLoading(false);
    }
  }

  if (count === 0) {
    return (
      <div className="rounded-lg border bg-muted/40 p-6 text-sm text-muted-foreground">
        Your cart is empty.{" "}
        <Link href="/shop" className="font-medium text-foreground underline-offset-4 hover:underline">
          Continue shopping
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!stripeConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {STRIPE_SERVER_CHECKOUT_ENV_HELP}
        </p>
      ) : null}
      {stripeConfigured && !supabaseForCartConfigured ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          {SUPABASE_SERVER_CHECKOUT_ENV_HELP}
        </p>
      ) : null}
      <div>
        <label className="text-sm font-medium" htmlFor="co-email">
          Email for receipt (optional if logged in elsewhere)
        </label>
        <input
          id="co-email"
          type="email"
          className="mt-1 h-11 w-full max-w-md rounded-md border border-input bg-white px-3 text-sm"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        Prescription-flagged carts use manual capture until Nicole approves. Free shipping reminder at{" "}
        {formatMoney(SITE.freeShippingMinCents)}+ still applies at fulfillment.
      </p>
      {stripeErr ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{stripeErr}</p>
      ) : null}
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      <Button type="button" variant="navy" size="lg" disabled={loading || !cartPayReady} onClick={pay}>
        {loading ? "Redirecting to Stripe…" : "Pay securely with Stripe"}
      </Button>
    </div>
  );
}
