"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type NavHoverMenuProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

/** Desktop nav flyout — hover bridge avoids the gap that closes the menu mid-travel. */
export function NavHoverMenu({ label, className, children }: NavHoverMenuProps) {
  return (
    <div className={cn("group relative shrink-0", className)}>
      <button
        type="button"
        className="flex items-center gap-1 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]"
        aria-haspopup="true"
      >
        {label}
        <ChevronDown className="h-3.5 w-3.5 opacity-60 transition group-hover:rotate-180" />
      </button>
      <div className="absolute left-0 top-full z-50 hidden w-56 pt-1 group-hover:block group-focus-within:block">
        <div className="max-h-[min(20rem,70vh)] overflow-y-auto rounded-md border bg-white py-2 shadow-lg ring-1 ring-black/5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function NavHoverMenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-2 text-sm text-[hsl(222,30%,32%)] transition hover:bg-[hsl(350,85%,96%)] hover:text-[hsl(222,47%,18%)]"
    >
      {children}
    </Link>
  );
}
