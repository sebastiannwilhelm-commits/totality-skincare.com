import { NextResponse } from "next/server";

/** Stub: forward to Resend / Zendesk / Help Scout in communications phase. */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: string; email?: string; message?: string };
    if (!body.email || !body.message) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
