import Link from "next/link";

import { NativeSkinQuiz } from "@/components/native-skin-quiz";

export const metadata = {
  title: "Skin care quiz",
  description: "Native multi-step quiz with saved results and product matches.",
};

export default function SkinCareQuizPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Skin care quiz</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Match me with the right products</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Answer a few questions — we log results to Supabase for your team and show on-brand recommendations.
      </p>
      <NativeSkinQuiz />
    </main>
  );
}
