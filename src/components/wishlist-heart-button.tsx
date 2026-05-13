"use client";

import { Heart } from "lucide-react";

import { useWishlist } from "@/context/wishlist-context";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WishlistHeartButton({
  slug,
  className,
  label = "Wishlist",
}: {
  slug: string;
  className?: string;
  label?: string;
}) {
  const { has, toggle } = useWishlist();
  const on = has(slug);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn("shrink-0", on && "border-rose-300 bg-rose-50", className)}
      aria-pressed={on}
      aria-label={on ? `Remove from ${label}` : `Add to ${label}`}
      onClick={() => toggle(slug)}
    >
      <Heart className={cn("h-4 w-4", on && "fill-rose-500 text-rose-600")} />
    </Button>
  );
}
