import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminQuizPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quiz_sessions")
    .select("id, created_at, email, completed, recommended_slugs, answers")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return <p className="text-sm text-red-300">{error.message}</p>;

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Skin quiz results</h1>
      <div className="mt-6 space-y-4">
        {(data ?? []).map((row) => (
          <div key={row.id} className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
            <div className="flex flex-wrap justify-between gap-2 text-stone-300">
              <span>{new Date(row.created_at).toLocaleString()}</span>
              <span>{row.email ?? "anonymous"}</span>
            </div>
            <p className="mt-2 text-xs text-stone-500">Recommended: {(row.recommended_slugs ?? []).join(", ") || "—"}</p>
            <pre className="mt-2 max-h-40 overflow-auto rounded bg-black/40 p-2 text-xs text-stone-400">
              {JSON.stringify(row.answers, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}
