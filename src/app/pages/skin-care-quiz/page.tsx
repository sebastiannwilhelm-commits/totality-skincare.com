import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE } from "@/config/store";

export const metadata = {
  title: "Skin care quiz",
  description: "Match with the right products — same entry point as the Shopify quiz page.",
};

export default function SkinCareQuizPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Skin care quiz</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Match me with the right products</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The live quiz still runs on Shopify. Use the button below to answer the same questionnaire there
        until this route hosts a native multi-step intake tied to your catalog and Supabase.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="blush" size="lg">
          <a href={SITE.legacyQuizUrl} target="_blank" rel="noreferrer">
            Open quiz (totality-skincare.com)
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/shop">Browse shop</Link>
        </Button>
      </div>
    </main>
  );
}
