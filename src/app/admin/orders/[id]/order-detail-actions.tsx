"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type Props = {
  orderId: string;
  initialStatus: string;
  initialTracking: string;
  initialCarrier: string;
  requiresRx: boolean;
  rxStatus: "pending" | "approved" | "denied" | "none";
};

export function OrderDetailActions({
  orderId,
  initialStatus,
  initialTracking,
  initialCarrier,
  requiresRx,
  rxStatus,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = React.useState(initialStatus);
  const [tracking, setTracking] = React.useState(initialTracking);
  const [carrier, setCarrier] = React.useState(initialCarrier);
  const [loading, setLoading] = React.useState(false);
  const [rxLoading, setRxLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function saveOrder() {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        tracking_number: tracking,
        shipping_carrier: carrier,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Update failed");
      return;
    }
    router.refresh();
  }

  async function approveRx() {
    setRxLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/prescriptions/${orderId}/approve`, { method: "POST" });
    setRxLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Approve failed");
      return;
    }
    router.refresh();
  }

  async function denyRx() {
    setRxLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/prescriptions/${orderId}/deny`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: "Denied by admin review." }),
    });
    setRxLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Deny failed");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Fulfillment</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Status
          <select
            className="mt-1 w-full rounded-md border border-white/20 bg-[hsl(222,47%,12%)] px-2 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="paid">paid</option>
            <option value="pending_approval">pending_approval</option>
            <option value="authorized">authorized</option>
            <option value="shipped">shipped</option>
            <option value="cancelled">cancelled</option>
            <option value="refunded">refunded</option>
          </select>
        </label>
        <label className="text-sm">
          Carrier
          <input
            className="mt-1 w-full rounded-md border border-white/20 bg-[hsl(222,47%,12%)] px-2 py-2 text-sm"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="USPS, UPS, FedEx"
          />
        </label>
        <label className="text-sm sm:col-span-2">
          Tracking number
          <input
            className="mt-1 w-full rounded-md border border-white/20 bg-[hsl(222,47%,12%)] px-2 py-2 text-sm"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
          />
        </label>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={loading} onClick={saveOrder}>
        {loading ? "Saving…" : "Save order"}
      </Button>

      {requiresRx && rxStatus === "pending" ? (
        <div className="border-t border-white/10 pt-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Prescription review</h2>
          <p className="mt-1 text-xs text-stone-500">Approve captures payment (manual capture) and authorizes fulfillment.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" disabled={rxLoading} onClick={approveRx}>
              Approve (Nicole)
            </Button>
            <Button type="button" size="sm" variant="outline" disabled={rxLoading} onClick={denyRx}>
              Deny
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-red-300">{error}</p> : null}
    </div>
  );
}
