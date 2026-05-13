import { NextResponse } from "next/server";

/** Stub: connect Resend + Supabase `newsletter_subscribers` in communications phase. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { firstName?: string; email?: string };
    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ ok: false, error: "email_required" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
