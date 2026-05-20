import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const supabase = createAdminDataClient();

  const [{ count: leadCount }, { count: quizCount }, { count: checkoutCount }, { count: orderCount }] =
    await Promise.all([
      supabase.from("leads").select("id", { count: "exact", head: true }),
      supabase.from("quiz_sessions").select("id", { count: "exact", head: true }),
      supabase.from("checkout_sessions").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "Leads", value: leadCount ?? 0, href: "/admin/leads" },
    { label: "Quiz sessions", value: quizCount ?? 0, href: "/admin/quiz" },
    { label: "Stripe checkouts", value: checkoutCount ?? 0, href: "/admin/checkouts" },
    { label: "Orders", value: orderCount ?? 0, href: "/admin/orders" },
  ];

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold">Overview</h1>
      <p className="mt-2 max-w-xl text-sm text-stone-400">
        Totality storefront operations. Grant Supabase-auth admins with{" "}
        <code className="rounded bg-black/40 px-1 py-0.5 text-xs">insert into admin_roles (user_id) values (&apos;…&apos;);</code>{" "}
        or set <code className="rounded bg-black/40 px-1 py-0.5 text-xs">ADMIN_EMAILS</code> for Firebase sign-in (see{" "}
        <code className="rounded bg-black/40 px-1 py-0.5 text-xs">.env.example</code>).
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <a
            key={c.label}
            href={c.href}
            className="rounded-xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{c.label}</p>
            <p className="mt-2 font-serif text-3xl font-semibold text-white">{c.value}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
