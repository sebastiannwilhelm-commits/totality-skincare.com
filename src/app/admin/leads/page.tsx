import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = await createClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, created_at, source, email, first_name, page_url")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return <p className="text-sm text-red-300">Could not load leads: {error.message}</p>;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Leads</h1>
      <p className="mt-2 text-sm text-stone-400">Popup, footer, quiz, and contact captures.</p>
      <div className="mt-6 overflow-x-auto rounded-lg border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-stone-400">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Source</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Page</th>
            </tr>
          </thead>
          <tbody>
            {(leads ?? []).map((row) => (
              <tr key={row.id} className="border-b border-white/5 hover:bg-white/5">
                <td className="px-3 py-2 text-stone-300">{new Date(row.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">{row.source}</td>
                <td className="px-3 py-2 font-medium">{row.email}</td>
                <td className="px-3 py-2 text-stone-300">{row.first_name ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-stone-500">{row.page_url ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
