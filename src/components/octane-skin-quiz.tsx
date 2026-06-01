"use client";

import Script from "next/script";

/** Same Octane AI embed as totality-skincare.com/pages/skin-care-quiz */
const OCTANE_QUIZ_ID = "LIYfTYmw49oOSyrr";
const OCTANE_SCRIPT_SRC = "https://app.octaneai.com/c3i9eu1ezsw2jf8u/quiz.js";

export function OctaneSkinQuiz() {
  return (
    <>
      <div
        className="octane-ai-quiz w-full min-h-[calc(100vh-12rem)]"
        data-quiz-id={OCTANE_QUIZ_ID}
        data-embed-type="fullscreen"
      />
      <Script src={OCTANE_SCRIPT_SRC} strategy="afterInteractive" />
    </>
  );
}
