import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; message?: string };
    if (!body.email || !body.message) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    try {
      const supabase = createServiceClient();
      const parts = (body.name ?? "").trim().split(/\s+/);
      const first = parts[0] || null;
      const last = parts.length > 1 ? parts.slice(1).join(" ") : null;
      await supabase.from("leads").insert({
        source: "contact_form",
        email: body.email.trim().toLowerCase(),
        first_name: first,
        last_name: last,
        metadata: { message: body.message },
      });
    } catch {
      /* service role optional */
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
