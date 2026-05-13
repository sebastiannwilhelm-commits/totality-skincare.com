"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewsletterForm({ className }: { className?: string }) {
  const [first, setFirst] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: first, email }),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      setFirst("");
      setEmail("");
    } catch {
      setStatus("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("space-y-3", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="sr-only" htmlFor="nl-first">
            First name
          </label>
          <input
            id="nl-first"
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            placeholder="First name"
            value={first}
            onChange={(e) => setFirst(e.target.value)}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="nl-email">
            Email
          </label>
          <input
            id="nl-email"
            type="email"
            required
            className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
            placeholder="Email*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <Button type="submit" variant="navy" disabled={status === "loading"}>
        {status === "loading" ? "Signing up…" : "Sign Up"}
      </Button>
      {status === "ok" ? (
        <p className="text-sm text-green-700">Thanks — you&apos;re on the list.</p>
      ) : null}
      {status === "err" ? (
        <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
      ) : null}
    </form>
  );
}
