"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";

export function PrescriptionIntakeForm({ token }: { token: string }) {
  const [loading, setLoading] = React.useState(true);
  const [valid, setValid] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [fullName, setFullName] = React.useState("");
  const [dob, setDob] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [history, setHistory] = React.useState("");
  const [allergies, setAllergies] = React.useState("");
  const [meds, setMeds] = React.useState("");
  const [attestation, setAttestation] = React.useState(false);

  React.useEffect(() => {
    void fetch(`/api/orders/prescription?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j: { valid?: boolean; submitted?: boolean }) => {
        setValid(Boolean(j.valid));
        setSubmitted(Boolean(j.submitted));
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch("/api/orders/prescription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token,
        full_name: fullName,
        date_of_birth: dob,
        phone,
        medical_history: history,
        allergies,
        current_medications: meds,
        attestation,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error ?? "Could not submit form.");
      return;
    }
    setSubmitted(true);
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!valid) return <p className="text-sm text-destructive">This prescription link is invalid or expired.</p>;
  if (submitted) {
    return (
      <p className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        Thank you — your intake form was submitted. Dr. Nicole will review your order.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-lg space-y-4">
      <p className="text-sm text-muted-foreground">
        Complete this medical intake for your prescription order. Information is reviewed by Dr. Nicole.
      </p>
      <div>
        <label className="text-sm font-medium" htmlFor="rx-name">
          Full legal name
        </label>
        <input
          id="rx-name"
          required
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="rx-dob">
          Date of birth
        </label>
        <input
          id="rx-dob"
          type="date"
          required
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="rx-phone">
          Phone
        </label>
        <input
          id="rx-phone"
          type="tel"
          className="mt-1 h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="rx-history">
          Relevant medical history
        </label>
        <textarea
          id="rx-history"
          rows={3}
          className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
          value={history}
          onChange={(e) => setHistory(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="rx-allergies">
          Allergies
        </label>
        <textarea
          id="rx-allergies"
          rows={2}
          className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="rx-meds">
          Current medications
        </label>
        <textarea
          id="rx-meds"
          rows={2}
          className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-sm"
          value={meds}
          onChange={(e) => setMeds(e.target.value)}
        />
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" checked={attestation} onChange={(e) => setAttestation(e.target.checked)} required />
        <span>I confirm this information is accurate and authorize review for prescription fulfillment.</span>
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" className="w-full" variant="blush" disabled={saving}>
        {saving ? "Submitting…" : "Submit intake form"}
      </Button>
    </form>
  );
}
