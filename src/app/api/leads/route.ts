import { NextResponse } from "next/server";

import { isSupabaseServiceConfigured } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/service";

type Body = {
  source?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  page_url?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
    }

    if (!isSupabaseServiceConfigured()) {
      return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("leads").insert({
      source: body.source ?? "unknown",
      email: body.email.trim().toLowerCase(),
      first_name: body.first_name ?? null,
      last_name: body.last_name ?? null,
      phone: body.phone ?? null,
      page_url: body.page_url ?? null,
      user_agent: req.headers.get("user-agent"),
      metadata: body.metadata ?? {},
    });

    if (error) {
      console.error("lead insert", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
