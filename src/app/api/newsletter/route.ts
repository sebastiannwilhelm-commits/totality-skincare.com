import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/service";

/** Persists footer signups as leads when service role is configured; Resend can be added later. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { firstName?: string; email?: string };
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
    }

    try {
      const supabase = createServiceClient();
      await supabase.from("leads").insert({
        source: "footer_newsletter",
        email: body.email.trim().toLowerCase(),
        first_name: body.firstName?.trim() || null,
        metadata: {},
      });
    } catch {
      /* Missing SUPABASE_SERVICE_ROLE_KEY or DB unreachable — still return ok for UX */
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
