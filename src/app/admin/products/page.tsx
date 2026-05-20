import { formatMoney } from "@/config/store";
import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const supabase = createAdminDataClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug, name, price_cents, currency, inventory_count, is_prescription_required, is_active")
    .order("name")
    .limit(200);

  if (error) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-semibold">Products</h1>
        <p className="mt-4 text-sm text-red-300">{error.message}</p>
      </div>
    );
  }

  const lowStock = (data ?? []).filter((p) => p.inventory_count <= 5 && p.is_active);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Products (database)</h1>
      <p className="mt-2 text-sm text-stone-400">
        Checkout reads prices and inventory from here. Catalog images still come from the generated TS file.
      </p>
      {lowStock.length > 0 ? (
        <p className="mt-4 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {lowStock.length} product(s) at or below 5 units in stock.
        </p>
      ) : null}
      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase text-stone-400">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Price</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Rx</th>
              <th className="px-3 py-2">Active</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p) => (
              <tr key={p.slug} className="border-b border-white/5">
                <td className="max-w-[200px] truncate px-3 py-2">{p.name}</td>
                <td className="px-3 py-2 text-xs text-stone-400">{p.slug}</td>
                <td className="px-3 py-2">{formatMoney(p.price_cents, p.currency)}</td>
                <td className={`px-3 py-2 ${p.inventory_count <= 5 ? "text-amber-300" : ""}`}>
                  {p.inventory_count}
                </td>
                <td className="px-3 py-2">{p.is_prescription_required ? "Yes" : "—"}</td>
                <td className="px-3 py-2">{p.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
