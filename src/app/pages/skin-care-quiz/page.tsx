import Link from "next/link";

import { OctaneSkinQuiz } from "@/components/octane-skin-quiz";
import { SITE } from "@/config/store";

export const metadata = {
  title: "Skin Care Quiz",
  description:
    "Welcome to the Totality Skincare Quiz — answer a few questions and we will recommend the best products for your skin type.",
};

export default function SkinCareQuizPage() {
  return (
    <main className="bg-white">
      <div className="border-b border-[hsl(350,30%,90%)] bg-[hsl(350,40%,98%)] py-8 text-center">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[hsl(222,47%,18%)] sm:text-4xl">
          Skin Care Quiz
        </h1>
        <div className="mx-auto mt-4 h-px w-16 bg-[hsl(350,40%,75%)]" aria-hidden />
      </div>

      <OctaneSkinQuiz />

      <p className="border-t border-[hsl(350,30%,90%)] px-4 py-6 text-center text-xs text-muted-foreground">
        Quiz powered by Totality&apos;s skincare partner.{" "}
        <Link href={SITE.legacyQuizUrl} className="underline-offset-4 hover:underline">
          Open on totality-skincare.com
        </Link>{" "}
        if the quiz does not load.
      </p>
    </main>
  );
}
