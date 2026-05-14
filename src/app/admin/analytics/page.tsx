import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const supabase = createAdminDataClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: leads7 }, { count: orders7 }, { count: quizzes7 }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("orders").select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from("quiz_sessions").select("id", { count: "exact", head: true }).gte("created_at", since),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Analytics</h1>
      <p className="mt-2 text-sm text-stone-400">Rolling 7-day funnel (UTC).</p>
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
      </ul>
    </div>
  );
}
