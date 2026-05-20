import { NextResponse } from "next/server";
import Stripe from "stripe";

import { isAdminApiError, requireAdminApi } from "@/lib/auth/require-admin-api";
import { notifyRxDecision } from "@/lib/notifications/order-events";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { typescript: true });

export async function POST(req: Request, { params }: { params: { orderId: string } }) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const orderId = params.orderId;
  const body = (await req.json().catch(() => ({}))) as { notes?: string };
  const svc = createServiceClient();

  const { data: order } = await svc
    .from("orders")
    .select("id, requires_prescription_review, stripe_payment_intent_id, customers ( email, sms_number )")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!order.requires_prescription_review) {
    return NextResponse.json({ error: "not_rx_order" }, { status: 400 });
  }

  const piId = order.stripe_payment_intent_id;
  if (piId && process.env.STRIPE_SECRET_KEY) {
    try {
      await stripe().paymentIntents.cancel(piId);
    } catch (e) {
      console.error("cancel pi", e);
    }
  }

  const now = new Date().toISOString();
  await svc.from("orders").update({ status: "cancelled" }).eq("id", orderId);

  const { data: rx } = await svc.from("prescriptions").select("form_data").eq("order_id", orderId).maybeSingle();
  const form_data = {
    ...((rx?.form_data as Record<string, unknown>) ?? {}),
    denied_at: now,
    denied_by: admin.email,
    denial_notes: typeof body.notes === "string" ? body.notes : "",
  };
  await svc.from("prescriptions").update({ form_data, authorized_by_nicole: false }).eq("order_id", orderId);

  const cust = order.customers as { email: string; sms_number: string | null } | { email: string; sms_number: string | null }[] | null;
  const email = Array.isArray(cust) ? cust[0]?.email : cust?.email;
  const sms = Array.isArray(cust) ? cust[0]?.sms_number : cust?.sms_number;
  if (email) {
    void notifyRxDecision({ email, approved: false, smsNumber: sms });
  }

  return NextResponse.json({ ok: true, status: "cancelled" });
}
