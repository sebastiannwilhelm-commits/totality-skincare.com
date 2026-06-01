import { NextResponse } from "next/server";

import { getAdminConfigStatus } from "@/lib/auth/admin-config-status";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getAdminConfigStatus());
}
