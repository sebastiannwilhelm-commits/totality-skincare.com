"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/config/store";

type OrderResult = {
  id: string;
  status: string;
  tracking_number: string | null;
  shipping_carrier: string | null;
  total_cents: number;
  currency: string;
  created_at: string;
};

export function TrackOrderLookup() {
  const [email, setEmail] = React.useState("");
  const [orderId, setOrderId] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<OrderResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);
    const res = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, order_id: orderId }),
    });
    const j = (await res.json()) as { found?: boolean; order?: OrderResult; error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(j.error ?? "Lookup failed");
      return;
    }
    if (!j.found || !j.order) {
      setError("No order found for that email and order ID.");
      return;
    }
    setOrder(j.order);
  }

  return (
    <div className="mt-8 space-y-6">
      <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 rounded-lg border bg-card p-4">
        <p className="text-sm text-muted-foreground">Enter the email used at checkout and your order ID from your confirmation.</p>
        <div>
          <label className="text-sm font-medium" htmlFor="track-email">
            Email
          </label>
          <input
            id="track-email"
            type="email"
            required
            className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium" htmlFor="track-order-id">
            Order ID
          </label>
          <input
            id="track-order-id"
            required
            className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 font-mono text-sm"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="UUID from confirmation email"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" variant="blush" disabled={loading}>
          {loading ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {order ? (
        <div className="mx-auto max-w-md rounded-lg border border-green-200 bg-green-50 p-4 text-sm">
          <p className="font-medium text-green-900">Order found</p>
          <p className="mt-2 capitalize text-green-800">Status: {order.status.replace(/_/g, " ")}</p>
          <p className="mt-1 text-green-800">Placed: {new Date(order.created_at).toLocaleString()}</p>
          <p className="mt-1 text-green-800">Total: {formatMoney(order.total_cents, order.currency)}</p>
          {order.tracking_number ? (
            <p className="mt-2 text-green-800">
              {order.shipping_carrier ? `${order.shipping_carrier}: ` : ""}
              {order.tracking_number}
            </p>
          ) : (
            <p className="mt-2 text-green-700">Tracking not available yet — check back after shipment.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
