import { NextResponse } from "next/server";
import Stripe from "stripe";

import { PRODUCTS, productBySlug } from "@/config/store";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { typescript: true });

type Line = { slug: string; quantity: number };

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  try {
    const body = (await req.json()) as { lines?: Line[]; customer_email?: string; mode?: "payment" | "subscription" };
    const lines = Array.isArray(body.lines) ? body.lines : [];
    const supabase = createServiceClient();
    const origin = new URL(req.url).origin;

    if (body.mode === "subscription") {
      const priceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
      if (!priceId) {
        return NextResponse.json({ error: "subscription_price_not_configured" }, { status: 503 });
      }
      const session = await stripe().checkout.sessions.create({
        mode: "subscription",
        customer_email: body.customer_email,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/subscribe?cancelled=1`,
        metadata: { type: "subscription" },
      });
      return NextResponse.json({ url: session.url });
    }

    if (lines.length === 0) {
      return NextResponse.json({ error: "empty_cart" }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let subtotal = 0;
    let requiresRx = false;

    for (const line of lines) {
      if (!line.slug || line.quantity < 1) continue;
      const seed = productBySlug(line.slug);
      if (!seed || seed.comingSoon) continue;

      const { data: row } = await supabase
        .from("products")
        .select("id, name, price_cents, is_prescription_required")
        .eq("slug", line.slug)
        .maybeSingle();

      const name = row?.name ?? seed.name;
      const unit = Number(row?.price_cents ?? seed.priceCents);
      const rx = Boolean(row?.is_prescription_required ?? seed.isPrescriptionRequired);
      if (rx) requiresRx = true;
      subtotal += unit * line.quantity;

      lineItems.push({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: unit,
          product_data: {
            name,
            metadata: { slug: line.slug },
          },
        },
      });
    }

    if (lineItems.length === 0) {
      return NextResponse.json({ error: "no_valid_lines" }, { status: 400 });
    }

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      customer_email: body.customer_email,
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?cancelled=1`,
      payment_intent_data: requiresRx
        ? {
            capture_method: "manual",
            metadata: { requires_rx: "true" },
          }
        : undefined,
      metadata: {
        cart: JSON.stringify(lines),
        requires_rx: requiresRx ? "true" : "false",
        subtotal_cents: String(subtotal),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("checkout session", e);
    return NextResponse.json({ error: "stripe_error" }, { status: 500 });
  }
}
