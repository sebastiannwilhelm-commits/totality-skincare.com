"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "totality_lead_popup_dismissed_until_v1";
const DELAY_MS = 7000;

export function LeadCapturePopup() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [first, setFirst] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "err">("idle");

  const blocked =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api");

  React.useEffect(() => {
    if (blocked) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const until = Number(raw);
        if (!Number.isNaN(until) && Date.now() < until) return;
      }
    } catch {
      /* ignore */
    }

    const t = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(t);
  }, [blocked, pathname]);

  if (blocked || !open) return null;

  function dismiss(days = 3) {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + days * 86400000));
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "exit_popup",
          first_name: first,
          email,
          page_url: typeof window !== "undefined" ? window.location.href : null,
        }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      dismiss(14);
    } catch {
      setStatus("err");
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]">
      <div
        className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lead-popup-title"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#ffb6c1] via-[#f4a6b5] to-[#c4a59d]" />
        <button
          type="button"
          className="absolute right-3 top-4 rounded-full p-1 text-stone-500 hover:bg-stone-100 hover:text-stone-800"
          aria-label="Close"
          onClick={() => dismiss(3)}
        >
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pb-2 pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c5959]">Totality Skincare</p>
          <h2 id="lead-popup-title" className="mt-2 font-serif text-2xl font-semibold leading-tight text-[#0c2148]">
            Get on the list
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-600">
            First access to sales, drops, and provider-curated routines — same promise as the footer signup on
            totality-skincare.com.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3 px-6 pb-6">
          <div>
            <label className="sr-only" htmlFor="lp-first">
              First name
            </label>
            <input
              id="lp-first"
              className="h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none ring-[#ffb6c1]/40 focus:ring-2"
              placeholder="First name"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div>
            <label className="sr-only" htmlFor="lp-email">
              Email
            </label>
            <input
              id="lp-email"
              type="email"
              required
              className="h-11 w-full rounded-md border border-stone-200 bg-white px-3 text-sm outline-none ring-[#ffb6c1]/40 focus:ring-2"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="h-12 w-full rounded-md border border-[#e8a0af] bg-[#ffb6c1] text-base font-semibold text-[#0c2148] hover:bg-[#ff9eb5]"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Joining…" : "Sign up"}
          </Button>
          {status === "ok" ? <p className="text-center text-sm text-green-700">You&apos;re in — thank you!</p> : null}
          {status === "err" ? (
            <p className="text-center text-sm text-destructive">Could not save. Try again later.</p>
          ) : null}
          <button
            type="button"
            className="w-full pt-1 text-center text-xs text-stone-500 underline-offset-2 hover:underline"
            onClick={() => dismiss(3)}
          >
            No thanks
          </button>
        </form>
      </div>
    </div>
  );
}
