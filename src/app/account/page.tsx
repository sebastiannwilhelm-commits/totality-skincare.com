import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Account</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Customer login, order history, addresses, and rewards will use Supabase Auth and your Postgres
        schema — replacing Shopify customer accounts and the Flits app bundle.
      </p>
      <ul className="mt-6 list-inside list-disc space-y-2 text-sm text-muted-foreground">
        <li>Profile &amp; delivery addresses</li>
        <li>My orders &amp; reorder</li>
        <li>Order tracking (Shippo + status webhooks)</li>
        <li>Store credit / referrals (optional parity with Flits)</li>
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button type="button" variant="outline" disabled>
          Sign in (coming soon)
        </Button>
        <Button asChild variant="ghost">
          <Link href="/shop">Shop</Link>
        </Button>
      </div>
    </main>
  );
}
