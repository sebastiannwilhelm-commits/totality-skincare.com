import Link from "next/link";

import { requireAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();

  return (
    <div className="min-h-screen bg-[hsl(222,47%,8%)] text-stone-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-56 shrink-0 border-r border-white/10 bg-[hsl(222,47%,10%)] p-4 md:block">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">Admin</p>
          <nav className="mt-4 flex flex-col gap-1 text-sm">
            <Link className="rounded-md px-2 py-2 hover:bg-white/10" href="/admin">
              Overview
            </Link>
            <Link className="rounded-md px-2 py-2 hover:bg-white/10" href="/admin/leads">
              Leads
            </Link>
            <Link className="rounded-md px-2 py-2 hover:bg-white/10" href="/admin/quiz">
              Quiz results
            </Link>
            <Link className="rounded-md px-2 py-2 hover:bg-white/10" href="/admin/orders">
              Orders
            </Link>
            <Link className="rounded-md px-2 py-2 hover:bg-white/10" href="/admin/checkouts">
              Checkouts
            </Link>
            <Link className="rounded-md px-2 py-2 hover:bg-white/10" href="/admin/analytics">
              Analytics
            </Link>
          </nav>
          <div className="mt-8 border-t border-white/10 pt-4 text-xs text-stone-500">
            <p className="truncate">{user.email}</p>
            <Link href="/" className="mt-2 inline-block text-stone-300 hover:underline">
              ← Storefront
            </Link>
          </div>
        </aside>
        <div className="flex-1 overflow-auto">
          <header className="flex items-center justify-between border-b border-white/10 bg-[hsl(222,47%,12%)] px-4 py-3 md:hidden">
            <span className="text-sm font-semibold">Admin</span>
            <Link href="/" className="text-xs text-stone-400 hover:underline">
              Store
            </Link>
          </header>
          <div className="p-4 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
