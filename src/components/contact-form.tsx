"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = React.useState<"idle" | "loading" | "ok" | "err">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("bad_status");
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <div>
        <label className="text-sm font-medium" htmlFor="c-name">
          Name
        </label>
        <input
          id="c-name"
          name="name"
          required
          className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="c-email">
          Email
        </label>
        <input
          id="c-email"
          name="email"
          type="email"
          required
          className="mt-1 h-10 w-full rounded-md border border-input bg-white px-3 text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="c-msg">
          Message
        </label>
        <textarea
          id="c-msg"
          name="message"
          required
          rows={5}
          className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" variant="navy" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send message"}
      </Button>
      {status === "ok" ? <p className="text-sm text-green-700">Thanks — we&apos;ll be in touch.</p> : null}
      {status === "err" ? (
        <p className="text-sm text-destructive">Could not send. Email us directly for now.</p>
      ) : null}
    </form>
  );
}
