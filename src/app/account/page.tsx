import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountPortalButton } from "@/components/account-portal-button";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Account" };

type CustomerSubscriptionRow = {
  id: string;
  status: string;
  stripe_subscription_id: string;
};

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/login?next=/account");
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("id, email, full_name, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const loyalty = customer
    ? await supabase.from("loyalty_accounts").select("points_balance").eq("customer_id", customer.id).maybeSingle()
    : { data: null as { points_balance: number } | null };

  const subs = customer
    ? await supabase
        .from("customer_subscriptions")
        .select("id, status, stripe_subscription_id, current_period_end")
        .eq("customer_id", customer.id)
    : { data: [] as CustomerSubscriptionRow[] };

  const orders = customer
    ? await supabase
        .from("orders")
        .select("id, status, total_cents, created_at")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(10)
    : { data: [] as { id: string; status: string; total_cents: number; created_at: string }[] };

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer?.full_name ?? user.email}
          </p>
        </div>
        <form action="/auth/sign-out" method="post">
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      <section className="mt-10 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Loyalty</h2>
        <p className="mt-2 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">
          {(loyalty.data?.points_balance ?? 0).toLocaleString()} pts
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Earned on completed non-Rx checkouts (see webhook rules). Flits-style credits can extend this ledger.
        </p>
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Subscriptions</h2>
        {(subs.data ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            No active subscription.{" "}
            <Link href="/subscribe" className="font-medium text-foreground underline-offset-4 hover:underline">
              Join the monthly club
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {(subs.data ?? []).map((s) => (
              <li key={s.id} className="flex justify-between gap-2">
                <span>{s.status}</span>
                <span className="truncate text-xs text-muted-foreground">{s.stripe_subscription_id}</span>
              </li>
            ))}
          </ul>
        )}
        {customer?.stripe_customer_id ? (
          <div className="mt-4">
            <AccountPortalButton />
          </div>
        ) : (
          <p className="mt-4 text-xs text-muted-foreground">
            Complete a Stripe checkout once to attach a billing customer for the self-serve portal.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent orders</h2>
        {(orders.data ?? []).length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {(orders.data ?? []).map((o) => (
              <li key={o.id} className="flex justify-between gap-2 border-b border-border pb-2 last:border-0">
                <span className="capitalize">{o.status.replace(/_/g, " ")}</span>
                <span>{(o.total_cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/wishlist" className="underline-offset-4 hover:underline">
          Wishlist
        </Link>
        <Link href="/pages/track-order" className="underline-offset-4 hover:underline">
          Track order
        </Link>
        <Link href="/admin" className="underline-offset-4 hover:underline">
          Admin
        </Link>
      </div>
    </main>
  );
}
