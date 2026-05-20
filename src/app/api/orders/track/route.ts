import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as { email?: string; order_id?: string };
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const orderId = typeof body.order_id === "string" ? body.order_id.trim() : "";

  if (!email || !orderId) {
    return NextResponse.json({ error: "email_and_order_id_required" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const svc = createServiceClient();
  const { data: customer } = await svc.from("customers").select("id").eq("email", email).maybeSingle();
  if (!customer?.id) {
    return NextResponse.json({ found: false });
  }

  const { data: order } = await svc
    .from("orders")
    .select("id, status, tracking_number, shipping_carrier, shipping_label_url, created_at, total_cents, currency")
    .eq("id", orderId)
    .eq("customer_id", customer.id)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ found: false });
  }

  return NextResponse.json({ found: true, order });
}
