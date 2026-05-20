import Link from "next/link";

import { formatMoney } from "@/config/store";
import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminPrescriptionsPage() {
  const supabase = createAdminDataClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, status, total_cents, currency, created_at, customers ( email ), prescriptions ( authorized_by_nicole, form_data )")
    .eq("requires_prescription_review", true)
    .in("status", ["pending_approval", "authorized"])
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-semibold">Prescriptions</h1>
        <p className="mt-4 text-sm text-red-300">{error.message}</p>
      </div>
    );
  }

  type Row = {
    id: string;
    status: string;
    total_cents: number;
    currency: string;
    created_at: string;
    customers: { email: string } | { email: string }[] | null;
    prescriptions: { authorized_by_nicole: boolean; form_data: Record<string, unknown> } | { authorized_by_nicole: boolean; form_data: Record<string, unknown> }[] | null;
  };

  const rows = (data ?? []) as Row[];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Prescription queue</h1>
      <p className="mt-2 text-sm text-stone-400">Orders awaiting intake and Nicole review.</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-stone-400">
            <tr>
              <th className="px-3 py-2">Created</th>
              <th className="px-3 py-2">Customer</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Intake</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-8 text-center text-stone-500">
                  No prescription orders in queue.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const cust = row.customers;
                const email = (Array.isArray(cust) ? cust[0]?.email : cust?.email) ?? "—";
                const rx = Array.isArray(row.prescriptions) ? row.prescriptions[0] : row.prescriptions;
                const fd = (rx?.form_data ?? {}) as Record<string, unknown>;
                const intake = fd.submitted_at ? "Submitted" : "Pending";
                return (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="px-3 py-2 whitespace-nowrap text-stone-300">
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{email}</td>
                    <td className="px-3 py-2">{row.status}</td>
                    <td className="px-3 py-2">{intake}</td>
                    <td className="px-3 py-2">{formatMoney(row.total_cents, row.currency)}</td>
                    <td className="px-3 py-2">
                      <Link href={`/admin/orders/${row.id}`} className="text-stone-200 underline hover:text-white">
                        Review
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
