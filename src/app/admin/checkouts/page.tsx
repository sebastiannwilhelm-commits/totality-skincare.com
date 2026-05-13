import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCheckoutsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checkout_sessions")
    .select("id, created_at, customer_email, amount_total_cents, currency, payment_status")
    .order("created_at", { ascending: false })
    .limit(150);

  if (error) return <p className="text-sm text-red-300">{error.message}</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Stripe checkouts</h1>
      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-stone-400">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-b border-white/5">
                <td className="px-3 py-2 text-stone-300">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{row.customer_email}</td>
                <td className="px-3 py-2">
                  {((row.amount_total_cents ?? 0) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                </td>
                <td className="px-3 py-2 text-stone-400">{row.payment_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
