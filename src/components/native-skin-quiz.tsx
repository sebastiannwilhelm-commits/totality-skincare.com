"use client";

import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { PRODUCTS } from "@/config/store";
import type { ConcernSlug } from "@/lib/types";

const SKIN_TYPES = ["Normal", "Combination", "Oily", "Dry", "Sensitive"] as const;
const GOALS = ["Clear breakouts", "Brighten tone", "Anti-aging", "Hydration", "Maintenance"] as const;

function scoreProducts(answers: {
  skinType: string;
  concern: ConcernSlug | "";
  goal: string;
}): string[] {
  const { concern } = answers;
  const ranked = PRODUCTS.filter((p) => !p.comingSoon).map((p) => {
    let s = 0;
    if (concern && p.concerns.includes(concern)) s += 3;
    if (answers.goal === "Anti-aging" && p.concerns.includes("anti-aging")) s += 2;
    if (answers.goal === "Brighten tone" && p.concerns.includes("brightening")) s += 2;
    if (answers.goal === "Clear breakouts" && p.concerns.includes("acne")) s += 2;
    if (answers.goal === "Hydration" && p.concerns.includes("dryness")) s += 2;
    if (answers.skinType === "Oily" && p.concerns.includes("acne")) s += 1;
    if (answers.skinType === "Dry" && p.concerns.includes("dryness")) s += 1;
    if (answers.skinType === "Sensitive" && p.concerns.includes("sensitive")) s += 1;
    return { slug: p.slug, s };
  });
  ranked.sort((a, b) => b.s - a.s);
  return ranked.slice(0, 4).map((r) => r.slug);
}

export function NativeSkinQuiz() {
  const [step, setStep] = React.useState(0);
  const [skinType, setSkinType] = React.useState<string>(SKIN_TYPES[0]);
  const [concern, setConcern] = React.useState<ConcernSlug | "">("");
  const [goal, setGoal] = React.useState<string>(GOALS[0]);
  const [email, setEmail] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [recs, setRecs] = React.useState<string[]>([]);

  async function finish() {
    const answers = { skinType, concern, goal };
    const recommended_slugs = scoreProducts({ skinType, concern, goal });
    setRecs(recommended_slugs);
    setBusy(true);
    try {
      await fetch("/api/quiz/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || undefined,
          answers,
          recommended_slugs,
        }),
      });
    } catch {
      /* still show results */
    } finally {
      setBusy(false);
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl space-y-6 py-8">
        <h2 className="font-serif text-2xl font-semibold text-[hsl(222,47%,18%)]">Your starter picks</h2>
        <p className="text-sm text-muted-foreground">
          Based on your answers — refine with your provider for prescription items.
        </p>
        <ul className="space-y-2 text-sm">
          {recs.map((slug) => {
            const p = PRODUCTS.find((x) => x.slug === slug);
            if (!p) return null;
            return (
              <li key={slug}>
                <Link href={`/products/${slug}`} className="font-medium text-[hsl(222,47%,26%)] underline-offset-4 hover:underline">
                  {p.name}
                </Link>
              </li>
            );
          })}
        </ul>
        <Button asChild variant="blush">
          <Link href="/shop">Shop all</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl py-8">
      <div className="mb-6 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${step >= i ? "bg-[#ffb6c1]" : "bg-stone-200"}`}
          />
        ))}
      </div>

      {step === 0 ? (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[hsl(222,47%,18%)]">How would you describe your skin?</h2>
          <div className="grid gap-2">
            {SKIN_TYPES.map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted">
                <input type="radio" name="st" checked={skinType === t} onChange={() => setSkinType(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
          <Button type="button" variant="navy" onClick={() => setStep(1)}>
            Continue
          </Button>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[hsl(222,47%,18%)]">Top concern right now?</h2>
          <div className="grid gap-2">
            {(
              [
                ["acne", "Acne / breakouts"],
                ["dryness", "Dryness / barrier"],
                ["brightening", "Dark spots / dullness"],
                ["anti-aging", "Fine lines / firmness"],
                ["sensitive", "Redness / sensitivity"],
              ] as const
            ).map(([slug, label]) => (
              <label key={slug} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted">
                <input type="radio" name="c" checked={concern === slug} onChange={() => setConcern(slug)} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button type="button" variant="navy" disabled={!concern} onClick={() => setStep(2)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[hsl(222,47%,18%)]">Primary goal</h2>
          <div className="grid gap-2">
            {GOALS.map((g) => (
              <label key={g} className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted">
                <input type="radio" name="g" checked={goal === g} onChange={() => setGoal(g)} />
                <span>{g}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" variant="navy" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold text-[hsl(222,47%,18%)]">Where should we send your matches?</h2>
          <input
            type="email"
            className="h-11 w-full rounded-md border border-input bg-white px-3 text-sm"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" variant="blush" disabled={busy} onClick={finish}>
              {busy ? "Saving…" : "See my picks"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
