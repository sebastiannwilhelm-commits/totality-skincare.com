import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const stripe = () => new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { typescript: true });

export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "stripe_not_configured" }, { status: 503 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: customer } = await supabase
    .from("customers")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: "no_stripe_customer" }, { status: 400 });
  }

  const origin = new URL(req.url).origin;
  const session = await stripe().billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${origin}/account`,
  });

  return NextResponse.json({ url: session.url });
}
