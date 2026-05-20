import { NextResponse } from "next/server";
import Stripe from "stripe";

import { isAdminApiError, requireAdminApi } from "@/lib/auth/require-admin-api";
import { notifyRxDecision } from "@/lib/notifications/order-events";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { typescript: true });

export async function POST(_req: Request, { params }: { params: { orderId: string } }) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const orderId = params.orderId;
  const svc = createServiceClient();

  const { data: order } = await svc
    .from("orders")
    .select("id, status, requires_prescription_review, stripe_payment_intent_id, customers ( email, sms_number )")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (!order.requires_prescription_review) {
    return NextResponse.json({ error: "not_rx_order" }, { status: 400 });
  }

  const piId = order.stripe_payment_intent_id;
  if (piId && process.env.STRIPE_SECRET_KEY) {
    try {
      await stripe().paymentIntents.capture(piId);
    } catch (e) {
      console.error("capture", e);
      return NextResponse.json({ error: "stripe_capture_failed" }, { status: 502 });
    }
  }

  const now = new Date().toISOString();
  await svc
    .from("orders")
    .update({ status: "authorized" })
    .eq("id", orderId);

  await svc
    .from("prescriptions")
    .update({
      authorized_by_nicole: true,
      nicole_signed_at: now,
      form_data: { ...(await getFormData(svc, orderId)), approved_at: now, approved_by: admin.email },
    })
    .eq("order_id", orderId);

  const cust = order.customers as { email: string; sms_number: string | null } | { email: string; sms_number: string | null }[] | null;
  const email = Array.isArray(cust) ? cust[0]?.email : cust?.email;
  const sms = Array.isArray(cust) ? cust[0]?.sms_number : cust?.sms_number;
  if (email) {
    void notifyRxDecision({ email, approved: true, smsNumber: sms });
  }

  return NextResponse.json({ ok: true, status: "authorized" });
}

async function getFormData(svc: ReturnType<typeof createServiceClient>, orderId: string) {
  const { data } = await svc.from("prescriptions").select("form_data").eq("order_id", orderId).maybeSingle();
  return (data?.form_data as Record<string, unknown>) ?? {};
}
