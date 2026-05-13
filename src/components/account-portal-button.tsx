"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export function AccountPortalButton() {
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  async function openPortal() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "portal_failed");
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      setErr("network");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button type="button" variant="outline" disabled={loading} onClick={openPortal}>
        {loading ? "Opening…" : "Manage subscription & billing"}
      </Button>
      {err ? <p className="mt-2 text-xs text-muted-foreground">{err}</p> : null}
    </div>
  );
}
