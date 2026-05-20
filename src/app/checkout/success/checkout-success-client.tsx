"use client";

import * as React from "react";
import Link from "next/link";

type Summary = {
  found: boolean;
  requiresRx?: boolean;
  intakeToken?: string | null;
};

export function CheckoutSuccessClient({ sessionId }: { sessionId: string | null }) {
  const [summary, setSummary] = React.useState<Summary | null>(null);

  React.useEffect(() => {
    if (!sessionId) return;
    void fetch(`/api/checkout/order-summary?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((j: Summary) => setSummary(j));
  }, [sessionId]);

  const intakeHref =
    summary?.intakeToken != null && summary.intakeToken
      ? `/orders/prescription?token=${encodeURIComponent(summary.intakeToken)}`
      : null;

  return (
    <>
      {summary?.found && summary.requiresRx && intakeHref ? (
        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-950">
          <p className="font-medium">Prescription items in your order</p>
          <p className="mt-1">Complete the medical intake form so Dr. Nicole can review your order.</p>
          <Link href={intakeHref} className="mt-3 inline-block font-semibold underline">
            Complete prescription intake →
          </Link>
        </div>
      ) : null}
    </>
  );
}
