import { Suspense } from "react";

import { PrescriptionIntakeForm } from "./prescription-intake-form";

export const metadata = { title: "Prescription intake" };

export default function PrescriptionIntakePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const token = typeof searchParams.token === "string" ? searchParams.token : "";
  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Prescription intake</h1>
      <div className="mt-8">
        {!token ? (
          <p className="text-sm text-destructive">Missing link token. Use the link from your order confirmation email.</p>
        ) : (
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
            <PrescriptionIntakeForm token={token} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
