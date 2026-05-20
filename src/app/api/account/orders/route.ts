import { NextResponse } from "next/server";

import { verifyFirebaseIdToken } from "@/lib/auth/firebase-id-token";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (!projectId) {
    return NextResponse.json({ error: "firebase_not_configured" }, { status: 503 });
  }

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 401 });
  }

  let verified;
  try {
    verified = await verifyFirebaseIdToken(token, projectId);
  } catch {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  if (!verified.email) {
    return NextResponse.json({ error: "email_required" }, { status: 403 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const svc = createServiceClient();
  const email = verified.email.trim().toLowerCase();

  const { data: customer } = await svc.from("customers").select("id").eq("email", email).maybeSingle();
  if (!customer?.id) {
    return NextResponse.json({ orders: [] });
  }

  const { data: orders, error } = await svc
    .from("orders")
    .select("id, status, total_cents, currency, requires_prescription_review, tracking_number, shipping_carrier, created_at")
    .eq("customer_id", customer.id)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}
