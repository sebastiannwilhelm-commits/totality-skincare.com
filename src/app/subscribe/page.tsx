"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function SubscribePage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function start() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "subscription",
          customer_email: email || undefined,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "failed");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setErr("network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Subscribe &amp; save</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Monthly club billing via Stripe Billing. Set{" "}
        <code className="rounded bg-muted px-1 text-xs">STRIPE_SUBSCRIPTION_PRICE_ID</code> to your recurring
        price in the Stripe Dashboard, then start below.
      </p>
      <div className="mt-8 space-y-4">
        <input
          type="email"
          className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {err ? <p className="text-sm text-destructive">{err}</p> : null}
        <Button type="button" variant="blush" size="lg" disabled={loading} onClick={start}>
          {loading ? "Opening Stripe…" : "Start subscription"}
        </Button>
      </div>
      <p className="mt-8 text-sm">
        <Link href="/account" className="underline-offset-4 hover:underline">
          Manage billing in account →
        </Link>
      </p>
    </main>
  );
}
