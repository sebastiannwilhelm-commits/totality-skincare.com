"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type ProductDescriptionProps = {
  html: string;
};

/** Matches totality-skincare.com PDP: truncated HTML + “More Details” toggle. */
export function ProductDescription({ html }: ProductDescriptionProps) {
  const [expanded, setExpanded] = React.useState(false);
  const trimmed = html.trim();

  if (!trimmed) {
    return null;
  }

  return (
    <div className="product-description mt-6 min-w-0 max-w-full">
      <div className="truncate">
        <div
          className={cn(
            "description product_description_part_small content truncate__long has-padding-top",
            expanded && "active",
          )}
          data-truncate="long"
          dangerouslySetInnerHTML={{ __html: trimmed }}
        />
        <button
          type="button"
          className={cn("readmore_btn button button--primary", expanded && "active-btn")}
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
        >
          More Details
        </button>
      </div>
    </div>
  );
}
