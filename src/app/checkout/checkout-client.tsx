"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { formatMoney, SITE } from "@/config/store";

export function CheckoutClient() {
  const { lines, count } = useCart();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function pay() {
    setErr(null);
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
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "checkout_failed");
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
      {err ? <p className="text-sm text-destructive">{err}</p> : null}
      <Button type="button" variant="navy" size="lg" disabled={loading} onClick={pay}>
        {loading ? "Redirecting to Stripe…" : "Pay securely with Stripe"}
      </Button>
    </div>
  );
}
