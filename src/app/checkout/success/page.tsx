import Link from "next/link";

import { CheckoutSuccessClient } from "./checkout-success-client";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sid = typeof searchParams.session_id === "string" ? searchParams.session_id : null;
  return (
    <main className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-green-800">Thank you!</h1>
      <p className="mt-4 text-sm text-muted-foreground">
        Your payment was submitted through Stripe. If your order included prescription items, complete the intake
        form below so Nicole can review it.
      </p>
      <CheckoutSuccessClient sessionId={sid} />
      {sid ? (
        <p className="mt-2 break-all text-xs text-muted-foreground">
          Session <code>{sid}</code>
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/account"
          className="rounded-md bg-[hsl(222,47%,18%)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[hsl(222,47%,26%)]"
        >
          View account
        </Link>
        <Link href="/shop" className="rounded-md border px-5 py-2.5 text-sm font-semibold hover:bg-muted">
          Keep shopping
        </Link>
      </div>
    </main>
  );
}
