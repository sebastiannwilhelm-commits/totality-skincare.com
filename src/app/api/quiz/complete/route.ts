import { NextResponse } from "next/server";

import { isSupabaseServiceConfigured } from "@/lib/supabase/config";
import { createServiceClient } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      answers?: Record<string, unknown>;
      recommended_slugs?: string[];
      user_id?: string | null;
    };

    if (!isSupabaseServiceConfigured()) {
      return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.from("quiz_sessions").insert({
      email: body.email?.trim().toLowerCase() ?? null,
      user_id: body.user_id ?? null,
      answers: body.answers ?? {},
      recommended_slugs: body.recommended_slugs ?? [],
      completed: true,
    });

    if (error) {
      console.error("quiz insert", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    if (body.email) {
      await supabase.from("leads").insert({
        source: "native_quiz",
        email: body.email.trim().toLowerCase(),
        first_name: null,
        metadata: { recommended_slugs: body.recommended_slugs ?? [] },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
