"use client";

import * as React from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  name: string;
  images: string[];
};

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const urls = images.length ? images : [];
  const [active, setActive] = React.useState(0);
  const main = urls[active] ?? urls[0];

  if (!main) {
    return (
      <div className="relative aspect-square min-w-0 max-w-full overflow-hidden rounded-xl border bg-muted" />
    );
  }

  return (
    <div className="min-w-0 max-w-full space-y-3">
      <div className="relative aspect-square min-w-0 max-w-full overflow-hidden rounded-xl border bg-muted">
        <Image
          key={main}
          src={main}
          alt={name}
          fill
          className="object-contain p-4 sm:object-cover sm:p-0"
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
        />
      </div>
      {urls.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Product images">
          {urls.map((src, index) => (
            <li key={src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                className={cn(
                  "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-muted transition",
                  index === active
                    ? "border-[hsl(222,47%,18%)]"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
                aria-label={`View image ${index + 1}`}
                aria-current={index === active}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="64px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
