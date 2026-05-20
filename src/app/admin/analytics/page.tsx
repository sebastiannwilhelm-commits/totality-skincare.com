import { formatMoney } from "@/config/store";
import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = createAdminDataClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: leads7 }, { count: orders7 }, { count: quizzes7 }, { data: orders }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("quiz_sessions").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase
      .from("orders")
      .select("total_cents, currency")
      .gte("created_at", since)
      .in("status", ["paid", "pending_approval", "authorized", "shipped"]),
  ]);

  const revenueCents = (orders ?? []).reduce((sum, o) => sum + (o.total_cents ?? 0), 0);

  const { data: recentOrderRows } = await supabase.from("orders").select("id").gte("created_at", since);
  const orderIds = (recentOrderRows ?? []).map((o) => o.id);

  const { data: topLines } =
    orderIds.length > 0
      ? await supabase
          .from("order_items")
          .select("quantity, products ( name, slug )")
          .in("order_id", orderIds)
          .limit(500)
      : { data: [] };

  type LineAgg = { name: string; qty: number };
  const agg = new Map<string, LineAgg>();
  for (const line of topLines ?? []) {
    const p = line.products as { name: string; slug: string } | { name: string; slug: string }[] | null;
    const name = (Array.isArray(p) ? p[0]?.name : p?.name) ?? "Unknown";
    const slug = (Array.isArray(p) ? p[0]?.slug : p?.slug) ?? name;
    const prev = agg.get(slug) ?? { name, qty: 0 };
    prev.qty += line.quantity;
    agg.set(slug, prev);
  }
  const topProducts = Array.from(agg.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Analytics</h1>
      <p className="mt-2 text-sm text-stone-400">Rolling 7-day funnel and sales (UTC).</p>
      <ul className="mt-6 space-y-3 text-sm">
        <li className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <span>Leads captured</span>
          <span className="font-semibold">{leads7 ?? 0}</span>
        </li>
        <li className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <span>Quiz completions</span>
          <span className="font-semibold">{quizzes7 ?? 0}</span>
        </li>
        <li className="flex justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
          <span>Orders created</span>
          <span className="font-semibold">{orders7 ?? 0}</span>
        </li>
        <li className="flex justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <span>Revenue (7d, excl. cancelled)</span>
          <span className="font-semibold">{formatMoney(revenueCents)}</span>
        </li>
      </ul>
      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-stone-400">Top products (units sold)</h2>
      {topProducts.length === 0 ? (
        <p className="mt-2 text-sm text-stone-500">No line items in this period.</p>
      ) : (
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {topProducts.map((p) => (
            <li key={p.name}>
              {p.name} — <span className="text-stone-400">{p.qty} units</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
