import { randomBytes } from "crypto";

export function generateIntakeToken(): string {
  return randomBytes(24).toString("hex");
}

export function intakeTokenFromMetadata(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const t = (metadata as Record<string, unknown>).intake_token;
  return typeof t === "string" && t.length > 0 ? t : null;
}
