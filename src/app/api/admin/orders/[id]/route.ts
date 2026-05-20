import { NextResponse } from "next/server";

import { isAdminApiError, requireAdminApi } from "@/lib/auth/require-admin-api";
import { notifyOrderShipped } from "@/lib/notifications/order-events";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const ALLOWED_STATUS = new Set(["paid", "pending_approval", "authorized", "shipped", "cancelled", "refunded"]);

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const admin = await requireAdminApi();
  if (isAdminApiError(admin)) return admin;

  const orderId = params.id;
  const body = (await req.json()) as {
    status?: string;
    tracking_number?: string;
    shipping_carrier?: string;
    shipping_label_url?: string;
  };

  const updates: Record<string, unknown> = {};
  if (body.status && ALLOWED_STATUS.has(body.status)) {
    updates.status = body.status;
  }
  if (typeof body.tracking_number === "string") updates.tracking_number = body.tracking_number.trim() || null;
  if (typeof body.shipping_carrier === "string") updates.shipping_carrier = body.shipping_carrier.trim() || null;
  if (typeof body.shipping_label_url === "string") updates.shipping_label_url = body.shipping_label_url.trim() || null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "no_updates" }, { status: 400 });
  }

  const svc = createServiceClient();
  const { data: before } = await svc
    .from("orders")
    .select("status, customers ( email, sms_number )")
    .eq("id", orderId)
    .maybeSingle();

  const { data, error } = await svc.from("orders").update(updates).eq("id", orderId).select("id, status").single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.status === "shipped" && before?.status !== "shipped") {
    const cust = before?.customers as { email: string; sms_number: string | null } | { email: string; sms_number: string | null }[] | null;
    const email = Array.isArray(cust) ? cust[0]?.email : cust?.email;
    const sms = Array.isArray(cust) ? cust[0]?.sms_number : cust?.sms_number;
    if (email) {
      void notifyOrderShipped({
        email,
        trackingNumber: typeof body.tracking_number === "string" ? body.tracking_number : null,
        carrier: typeof body.shipping_carrier === "string" ? body.shipping_carrier : null,
        smsNumber: sms,
      });
    }
  }

  return NextResponse.json({ order: data });
}
