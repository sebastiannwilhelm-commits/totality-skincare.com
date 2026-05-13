import Link from "next/link";

const copy = {
  account: {
    title: "Account is not available yet",
    body: "This page needs Supabase (URL + anon key) in the environment. Add them to `.env.local` from `.env.example`, then restart the dev server.",
  },
  admin: {
    title: "Admin is not available yet",
    body: "Admin uses Supabase Auth and the database. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your environment, then redeploy or restart locally.",
  },
  auth: {
    title: "Sign-in is not configured",
    body: "Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (see `.env.example`), then restart the app.",
  },
} as const;

export function SupabaseSetupNotice({
  variant,
  className = "",
}: {
  variant: keyof typeof copy;
  className?: string;
}) {
  const { title, body } = copy[variant];
  return (
    <div className={`rounded-xl border border-amber-200/80 bg-amber-50 p-5 text-sm text-amber-950 ${className}`}>
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-amber-900/90">{body}</p>
      <Link href="/" className="mt-4 inline-block font-medium text-amber-950 underline-offset-4 hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}

export function SupabaseSetupNoticeDark({ variant }: { variant: "admin" }) {
  const { title, body } = copy[variant];
  return (
    <div className="mx-auto max-w-md rounded-xl border border-white/15 bg-[hsl(222,47%,14%)] p-8 text-stone-100 shadow-lg">
      <p className="font-semibold text-lg">{title}</p>
      <p className="mt-3 text-sm text-stone-400">{body}</p>
      <Link href="/" className="mt-6 inline-block text-sm text-rose-200 underline-offset-4 hover:underline">
        ← Back to storefront
      </Link>
    </div>
  );
}
