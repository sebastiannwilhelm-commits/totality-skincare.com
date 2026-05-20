import Link from "next/link";

import { OrderDetailActions } from "./order-detail-actions";
import { formatMoney } from "@/config/store";
import { intakeTokenFromMetadata } from "@/lib/orders/intake-token";
import { createAdminDataClient } from "@/lib/supabase/admin-data";

export const dynamic = "force-dynamic";

type LineRow = {
  quantity: number;
  unit_price_cents: number;
  products: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createAdminDataClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, status, total_cents, currency, requires_prescription_review, tracking_number, shipping_carrier, stripe_payment_intent_id, stripe_checkout_session_id, metadata, created_at, customers ( email, full_name )",
    )
    .eq("id", params.id)
    .maybeSingle();

  if (error || !order) {
    return (
      <div>
        <h1 className="font-serif text-2xl font-semibold">Order not found</h1>
        <Link href="/admin/orders" className="mt-4 inline-block text-sm underline">
          ← Back to orders
        </Link>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("quantity, unit_price_cents, products ( name, slug )")
    .eq("order_id", params.id);

  const { data: rx } = await supabase
    .from("prescriptions")
    .select("authorized_by_nicole, form_data, nicole_signed_at")
    .eq("order_id", params.id)
    .maybeSingle();

  const cust = order.customers as { email: string; full_name: string | null } | { email: string; full_name: string | null }[] | null;
  const email = (Array.isArray(cust) ? cust[0]?.email : cust?.email) ?? "—";
  const formData = (rx?.form_data as Record<string, unknown>) ?? {};
  const submitted = Boolean(formData.submitted_at);

  let rxStatus: "pending" | "approved" | "denied" | "none" = "none";
  if (order.requires_prescription_review) {
    if (rx?.authorized_by_nicole) rxStatus = "approved";
    else if (formData.denied_at) rxStatus = "denied";
    else rxStatus = "pending";
  }

  const intakeToken = intakeTokenFromMetadata(order.metadata);

  return (
    <div>
      <Link href="/admin/orders" className="text-sm text-stone-400 hover:underline">
        ← Orders
      </Link>
      <h1 className="mt-2 font-serif text-2xl font-semibold">Order {order.id.slice(0, 8)}…</h1>
      <p className="mt-1 text-sm text-stone-400">
        {email} · {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
          <p>
            <span className="text-stone-400">Status:</span> {order.status}
          </p>
          <p className="mt-1">
            <span className="text-stone-400">Total:</span> {formatMoney(order.total_cents, order.currency)}
          </p>
          {order.stripe_payment_intent_id ? (
            <p className="mt-1 break-all text-xs text-stone-500">PI: {order.stripe_payment_intent_id}</p>
          ) : null}
        </div>
        {order.requires_prescription_review ? (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="font-medium text-amber-100">Prescription order</p>
            <p className="mt-1 text-stone-300">Intake submitted: {submitted ? "Yes" : "No"}</p>
            {intakeToken ? (
              <p className="mt-2 break-all text-xs">
                Intake link: /orders/prescription?token={intakeToken.slice(0, 8)}…
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-stone-400">Line items</h2>
      <ul className="mt-2 space-y-2 text-sm">
        {((items ?? []) as LineRow[]).map((line, i) => {
          const p = line.products;
          const name = (Array.isArray(p) ? p[0]?.name : p?.name) ?? "Product";
          return (
            <li key={i} className="flex justify-between rounded border border-white/10 px-3 py-2">
              <span>
                {name} × {line.quantity}
              </span>
              <span>{formatMoney(line.unit_price_cents * line.quantity, order.currency)}</span>
            </li>
          );
        })}
      </ul>

      {submitted && Object.keys(formData).length > 0 ? (
        <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Intake data</h2>
          <pre className="mt-2 overflow-auto text-xs text-stone-300">{JSON.stringify(formData, null, 2)}</pre>
        </div>
      ) : null}

      <OrderDetailActions
        orderId={order.id}
        initialStatus={order.status}
        initialTracking={order.tracking_number ?? ""}
        initialCarrier={order.shipping_carrier ?? ""}
        requiresRx={order.requires_prescription_review}
        rxStatus={rxStatus}
      />
    </div>
  );
}
