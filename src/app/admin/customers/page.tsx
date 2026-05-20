import Link from "next/link";

import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const supabase = createAdminDataClient();
  const { data, error } = await supabase
    .from("customers")
    .select("id, email, full_name, sms_number, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-semibold">Customers</h1>
        <p className="mt-4 text-sm text-red-300">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Customers</h1>
      <p className="mt-2 text-sm text-stone-400">Shopper profiles from checkout and sign-up.</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-stone-400">
            <tr>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">SMS</th>
              <th className="px-3 py-2">Since</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((c) => (
              <tr key={c.id} className="border-b border-white/5">
                <td className="px-3 py-2">{c.email}</td>
                <td className="px-3 py-2">{c.full_name ?? "—"}</td>
                <td className="px-3 py-2">{c.sms_number ?? "—"}</td>
                <td className="px-3 py-2 whitespace-nowrap text-stone-400">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-stone-500">
        View orders in{" "}
        <Link href="/admin/orders" className="underline">
          Orders
        </Link>
        .
      </p>
    </div>
  );
}
