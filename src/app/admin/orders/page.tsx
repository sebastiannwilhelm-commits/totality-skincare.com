import Link from "next/link";

import { formatMoney } from "@/config/store";
import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

type OrderRow = {
  id: string;
  status: string;
  total_cents: number;
  currency: string;
  requires_prescription_review: boolean;
  created_at: string;
  customers: { email: string } | { email: string }[] | null;
};

export default async function AdminOrdersPage() {
  const supabase = createAdminDataClient();

  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_cents, currency, requires_prescription_review, created_at, customers ( email )")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-semibold">Orders</h1>
        <p className="mt-4 text-sm text-red-300">{error.message}</p>
      </div>
    );
  }

  const orders = (data ?? []) as OrderRow[];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Orders</h1>
      <p className="mt-2 text-sm text-stone-400">
        Paid and prescription-pending orders. Detail view and status changes ship in Phase 1.
      </p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-stone-400">
            <tr>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Rx</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-stone-500">
                  No orders yet. Complete a Stripe test checkout to populate this list.
                </td>
              </tr>
            ) : (
              orders.map((row) => {
                const cust = row.customers;
                const email = (Array.isArray(cust) ? cust[0]?.email : cust?.email) ?? "—";
                return (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="px-3 py-2 whitespace-nowrap text-stone-300">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{email}</td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-white/10 px-2 py-0.5 text-xs">{row.status}</span>
                    </td>
                    <td className="px-3 py-2">{formatMoney(row.total_cents, row.currency)}</td>
                    <td className="px-3 py-2">{row.requires_prescription_review ? "Yes" : "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-stone-500">
        Stripe session audit:{" "}
        <Link href="/admin/checkouts" className="underline hover:text-stone-300">
          Checkouts
        </Link>
      </p>
    </div>
  );
}
