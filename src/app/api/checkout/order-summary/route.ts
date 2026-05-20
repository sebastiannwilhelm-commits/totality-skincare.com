import { NextResponse } from "next/server";

import { intakeTokenFromMetadata } from "@/lib/orders/intake-token";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id")?.trim();
  if (!sessionId) {
    return NextResponse.json({ error: "missing_session_id" }, { status: 400 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const svc = createServiceClient();
  const { data: order } = await svc
    .from("orders")
    .select("id, status, requires_prescription_review, metadata")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();

  if (!order) {
    return NextResponse.json({ found: false });
  }

  const intakeToken = intakeTokenFromMetadata(order.metadata);

  return NextResponse.json({
    found: true,
    orderId: order.id,
    status: order.status,
    requiresRx: order.requires_prescription_review,
    intakeToken,
  });
}
