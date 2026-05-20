import { NextResponse } from "next/server";

import { intakeTokenFromMetadata } from "@/lib/orders/intake-token";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

async function findOrderByToken(svc: ReturnType<typeof createServiceClient>, token: string) {
  const { data: order } = await svc
    .from("orders")
    .select("id, requires_prescription_review, metadata")
    .eq("requires_prescription_review", true)
    .contains("metadata", { intake_token: token })
    .maybeSingle();
  if (order) return order;
  const { data: orders } = await svc
    .from("orders")
    .select("id, requires_prescription_review, metadata")
    .eq("requires_prescription_review", true)
    .limit(200);
  if (!orders) return null;
  for (const o of orders) {
    if (intakeTokenFromMetadata(o.metadata) === token) return o;
  }
  return null;
}

export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token")?.trim();
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const svc = createServiceClient();
  const order = await findOrderByToken(svc, token);
  if (!order) return NextResponse.json({ valid: false });

  const { data: rx } = await svc.from("prescriptions").select("form_data").eq("order_id", order.id).maybeSingle();

  return NextResponse.json({
    valid: true,
    orderId: order.id,
    submitted: Boolean((rx?.form_data as Record<string, unknown> | undefined)?.submitted_at),
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    token?: string;
    full_name?: string;
    date_of_birth?: string;
    phone?: string;
    medical_history?: string;
    allergies?: string;
    current_medications?: string;
    attestation?: boolean;
  };

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!token) return NextResponse.json({ error: "missing_token" }, { status: 400 });
  if (!body.attestation) return NextResponse.json({ error: "attestation_required" }, { status: 400 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const svc = createServiceClient();
  const order = await findOrderByToken(svc, token);
  if (!order) return NextResponse.json({ error: "invalid_token" }, { status: 404 });

  const form_data = {
    full_name: body.full_name ?? "",
    date_of_birth: body.date_of_birth ?? "",
    phone: body.phone ?? "",
    medical_history: body.medical_history ?? "",
    allergies: body.allergies ?? "",
    current_medications: body.current_medications ?? "",
    submitted_at: new Date().toISOString(),
  };

  const { error } = await svc
    .from("prescriptions")
    .update({ form_data })
    .eq("order_id", order.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
