import { NextResponse } from "next/server";
import Stripe from "stripe";

import { notifyOrderConfirmation } from "@/lib/notifications/order-events";
import { generateIntakeToken } from "@/lib/orders/intake-token";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { typescript: true });

async function ensureCustomer(svc: ReturnType<typeof createServiceClient>, email: string) {
  const normalized = email.trim().toLowerCase();
  const { data: found } = await svc.from("customers").select("id").eq("email", normalized).maybeSingle();
  if (found?.id) return found.id as string;
  const { data: inserted, error } = await svc
    .from("customers")
    .insert({ email: normalized })
    .select("id")
    .single();
  if (error || !inserted) throw new Error("customer_create_failed");
  await svc.from("loyalty_accounts").upsert({ customer_id: inserted.id, points_balance: 0 }, { onConflict: "customer_id" });
  return inserted.id as string;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!secret || !key) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no_signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error("stripe webhook verify", err);
    return NextResponse.json({ error: "bad_signature" }, { status: 400 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const svc = createServiceClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const dup = await svc
      .from("checkout_sessions")
      .select("id")
      .eq("stripe_checkout_session_id", session.id)
      .maybeSingle();
    if (dup.data) {
      return NextResponse.json({ received: true });
    }

    const email =
      session.customer_details?.email ??
      session.customer_email ??
      (typeof session.customer === "object" && session.customer && !("deleted" in session.customer)
        ? (session.customer as Stripe.Customer).email
        : null);
    if (!email) {
      return NextResponse.json({ received: true });
    }

    const customerId = await ensureCustomer(svc, email);

    if (typeof session.customer === "string") {
      await svc.from("customers").update({ stripe_customer_id: session.customer }).eq("id", customerId);
    }

    await svc.from("checkout_sessions").insert({
      stripe_checkout_session_id: session.id,
      customer_email: email.toLowerCase(),
      customer_id: customerId,
      amount_total_cents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      payment_status: session.payment_status ?? null,
      metadata: {
        mode: session.mode,
        payment_intent: session.payment_intent,
      },
    });

    if (session.mode === "subscription") {
      const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
      if (subId) {
        const { data: ex } = await svc
          .from("customer_subscriptions")
          .select("id")
          .eq("stripe_subscription_id", subId)
          .maybeSingle();
        if (!ex) {
          await svc.from("customer_subscriptions").insert({
            customer_id: customerId,
            stripe_subscription_id: subId,
            stripe_price_id: null,
            status: "active",
            current_period_end: null,
          });
        }
      }
      return NextResponse.json({ received: true });
    }

    const cartRaw = session.metadata?.cart;
    let lines: { slug: string; quantity: number }[] = [];
    try {
      lines = cartRaw ? (JSON.parse(cartRaw) as { slug: string; quantity: number }[]) : [];
    } catch {
      lines = [];
    }

    const requiresRx = session.metadata?.requires_rx === "true";
    const intakeToken = requiresRx ? generateIntakeToken() : null;

    const { data: orderRow, error: orderErr } = await svc
      .from("orders")
      .insert({
        customer_id: customerId,
        status: requiresRx ? "pending_approval" : "paid",
        total_cents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        requires_prescription_review: requiresRx,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        metadata: {
          stripe_session: session.id,
          ...(intakeToken ? { intake_token: intakeToken } : {}),
        },
      })
      .select("id")
      .single();

    if (orderErr || !orderRow) {
      console.error("order insert", orderErr);
      return NextResponse.json({ received: true });
    }

    const orderId = orderRow.id as string;

    for (const line of lines) {
      const { data: prod } = await svc
        .from("products")
        .select("id, price_cents, inventory_count")
        .eq("slug", line.slug)
        .maybeSingle();
      if (!prod?.id) continue;
      await svc.from("order_items").insert({
        order_id: orderId,
        product_id: prod.id,
        quantity: line.quantity,
        unit_price_cents: prod.price_cents,
      });
      const nextInv = Math.max(0, (prod.inventory_count ?? 0) - line.quantity);
      await svc.from("products").update({ inventory_count: nextInv }).eq("id", prod.id);
    }

    if (requiresRx) {
      await svc.from("prescriptions").insert({
        order_id: orderId,
        form_data: { status: "awaiting_intake", note: "Collect intake post-checkout in Phase 2 UI." },
        authorized_by_nicole: false,
      });
    }

    if (!requiresRx) {
      const dollars = Math.max(0, Math.floor((session.amount_total ?? 0) / 100));
      const bonus = dollars * 10 + 100;
      const { data: acct } = await svc
        .from("loyalty_accounts")
        .select("points_balance")
        .eq("customer_id", customerId)
        .maybeSingle();
      const nextBal = (acct?.points_balance ?? 0) + bonus;
      await svc.from("loyalty_accounts").upsert(
        { customer_id: customerId, points_balance: nextBal, updated_at: new Date().toISOString() },
        { onConflict: "customer_id" },
      );
      await svc.from("loyalty_ledger").insert({
        customer_id: customerId,
        delta: bonus,
        reason: "order_completed",
        reference: orderId,
        metadata: { session_id: session.id },
      });
    }

    const { data: custRow } = await svc.from("customers").select("sms_number").eq("id", customerId).maybeSingle();

    void notifyOrderConfirmation({
      email: email.toLowerCase(),
      orderId,
      totalCents: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
      requiresRx,
      intakeToken: intakeToken ?? undefined,
      smsNumber: custRow?.sms_number ?? null,
    });
  }

  return NextResponse.json({ received: true });
}
