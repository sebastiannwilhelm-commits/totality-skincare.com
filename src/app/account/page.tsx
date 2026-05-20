"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";

import { Button } from "@/components/ui/button";
import { formatMoney } from "@/config/store";
import { FIREBASE_PUBLIC_ENV_HELP } from "@/lib/firebase/config-help";
import { getFirebaseAuth } from "@/lib/firebase/client";

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  requires_prescription_review: boolean;
  tracking_number: string | null;
  shipping_carrier: string | null;
  created_at: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [ready, setReady] = React.useState(false);
  const [user, setUser] = React.useState<User | null>(null);
  const [configError, setConfigError] = React.useState<string | null>(null);
  const [signingOut, setSigningOut] = React.useState(false);
  const [orders, setOrders] = React.useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = React.useState(false);

  React.useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch {
      setConfigError(FIREBASE_PUBLIC_ENV_HELP);
      setReady(true);
      return;
    }
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setReady(true);
    });
    return () => unsub();
  }, []);

  React.useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    async function loadOrders() {
      setOrdersLoading(true);
      try {
        const token = await user!.getIdToken();
        const res = await fetch("/api/account/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const j = (await res.json()) as { orders?: OrderRow[] };
        if (!cancelled) setOrders(j.orders ?? []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    }
    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function onSignOut() {
    try {
      setSigningOut(true);
      await signOut(getFirebaseAuth());
      router.push("/");
      router.refresh();
    } finally {
      setSigningOut(false);
    }
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="text-sm text-muted-foreground">Loading account…</p>
      </main>
    );
  }

  if (configError) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">{configError}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Account</h1>
        <p className="mt-2 text-sm text-muted-foreground">You need to sign in to view your account.</p>
        <Link href="/auth/login?next=/account" className="mt-4 inline-block text-sm font-medium underline-offset-4 hover:underline">
          Sign in
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.displayName || user.email}</p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={signingOut} onClick={onSignOut}>
          {signingOut ? "Signing out…" : "Sign out"}
        </Button>
      </div>

      <section className="mt-10 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Order history</h2>
        {ordersLoading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading orders…</p>
        ) : orders.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No orders yet for {user.email}. Orders use the same email as checkout.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o.id} className="rounded-md border border-border px-3 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium capitalize">{o.status.replace(/_/g, " ")}</span>
                  <span>{formatMoney(o.total_cents, o.currency)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</p>
                <p className="mt-1 break-all font-mono text-xs text-muted-foreground">ID: {o.id}</p>
                {o.tracking_number ? (
                  <p className="mt-1 text-xs">
                    {o.shipping_carrier ? `${o.shipping_carrier}: ` : ""}
                    {o.tracking_number}
                  </p>
                ) : null}
                {o.requires_prescription_review && o.status === "pending_approval" ? (
                  <p className="mt-1 text-xs text-amber-800">Prescription review in progress</p>
                ) : null}
                <Link href={`/pages/track-order`} className="mt-2 inline-block text-xs font-medium underline">
                  Track this order
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
