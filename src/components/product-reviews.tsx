"use client";

import Script from "next/script";

import { SITE } from "@/config/store";

type Props = {
  shopifyProductId: string;
  productTitle: string;
};

function JudgeMeScript() {
  return (
    <Script
      src="https://cdn.judge.me/widget_preloader.js"
      strategy="lazyOnload"
      data-shop-domain={SITE.shopifyDomain}
    />
  );
}

/** Star rating summary under price — matches live Judge.me preview badge. */
export function ProductReviewBadge({ shopifyProductId }: { shopifyProductId: string }) {
  return (
    <>
      <JudgeMeScript />
      <div
        className="jdgm-widget jdgm-preview-badge"
        data-id={shopifyProductId}
        data-auto-install="false"
      />
    </>
  );
}

/** Full review list at bottom of PDP. */
export function ProductReviews({ shopifyProductId, productTitle }: Props) {
  return (
    <section className="mt-16 border-t pt-12" aria-label="Customer reviews">
      <h2 className="font-serif text-2xl font-semibold text-[hsl(222,47%,18%)]">Customer reviews</h2>
      <JudgeMeScript />
      <div
        className="jdgm-widget jdgm-review-widget mt-8"
        data-id={shopifyProductId}
        data-product-title={productTitle}
      />
    </section>
  );
}
