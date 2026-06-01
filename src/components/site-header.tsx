"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react";

import { NAV_BRANDS } from "@/config/featured-brands";
import { CONCERNS, LEGACY_STORE_URL, SITE } from "@/config/store";
import { NavHoverMenu, NavHoverMenuLink } from "@/components/nav-hover-menu";
import { useCart } from "@/context/cart-context";
import { useWishlist } from "@/context/wishlist-context";
import { PRODUCTS } from "@/config/store";
import { cn } from "@/lib/utils";

import {
  HeaderSupabaseAuthDesktop,
  HeaderSupabaseAuthDrawer,
  HeaderSupabaseAuthProvider,
} from "@/components/header-supabase-auth";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  const results = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.slug.includes(s) ||
        p.brand.includes(s),
    ).slice(0, 8);
  }, [q]);

  return (
    <HeaderSupabaseAuthProvider>
      <>
      <header className="sticky top-0 z-40 overflow-visible border-b border-[hsl(350,30%,88%)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 overflow-visible px-4 sm:h-16 sm:px-6">
          <button
            type="button"
            className="rounded-md p-2 text-[hsl(222,47%,18%)] lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex min-w-0 flex-1 items-center gap-2 lg:flex-none">
            <span className="truncate font-semibold tracking-tight text-[hsl(222,47%,18%)] sm:text-lg">
              {SITE.name}
            </span>
          </Link>

          <nav className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-4 overflow-visible text-sm font-medium text-[hsl(222,30%,32%)] xl:gap-6 lg:flex">
            <Link
              href="/shop"
              className="shrink-0 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]"
            >
              Shop all
            </Link>
            <NavHoverMenu label="Brands">
              {NAV_BRANDS.map((b) => (
                <NavHoverMenuLink key={b.slug} href={`/collections/brand/${b.slug}`}>
                  {b.label}
                </NavHoverMenuLink>
              ))}
              <div className="my-1 border-t border-[hsl(350,30%,90%)]" />
              <NavHoverMenuLink href="/shop">Shop all brands</NavHoverMenuLink>
            </NavHoverMenu>
            <NavHoverMenu label="Concerns">
              {CONCERNS.map((c) => (
                <NavHoverMenuLink key={c.slug} href={`/collections/concern/${c.slug}`}>
                  {c.label}
                </NavHoverMenuLink>
              ))}
            </NavHoverMenu>
            <Link
              href="/pages/skin-care-quiz"
              className="shrink-0 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]"
            >
              Skin quiz
            </Link>
            <Link
              href="/blogs/news"
              className="shrink-0 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]"
            >
              Blog
            </Link>
            <Link
              href="/pages/track-order"
              className="shrink-0 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]"
            >
              Track order
            </Link>
            <Link
              href="/pages/contact"
              className="shrink-0 whitespace-nowrap transition hover:text-[hsl(222,47%,18%)]"
            >
              Contact
            </Link>
            <HeaderSupabaseAuthDesktop />
            <a
              href={LEGACY_STORE_URL}
              className="shrink-0 whitespace-nowrap text-xs font-normal text-muted-foreground transition hover:text-foreground"
            >
              Legacy store
            </a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative text-[hsl(222,47%,18%)]"
              aria-label="Wishlist"
            >
              <Link href="/wishlist">
                <Heart className="h-5 w-5" />
                {wishCount > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-200 px-1 text-[10px] font-semibold text-[hsl(222,47%,18%)]">
                    {wishCount > 99 ? "99+" : wishCount}
                  </span>
                ) : null}
              </Link>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-[hsl(222,47%,18%)]"
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative text-[hsl(222,47%,18%)]"
              aria-label="Cart"
            >
              <Link href="/cart">
                <ShoppingBag className="h-5 w-5" />
                {count > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(350,85%,78%)] px-1 text-[10px] font-semibold text-[hsl(222,47%,18%)]">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : null}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {searchOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24"
          role="dialog"
          aria-modal="true"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-lg border bg-white p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b pb-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                className="flex-1 border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Search products…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <Button type="button" variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ul className="max-h-72 overflow-auto py-2 text-sm">
              {results.length === 0 ? (
                <li className="px-2 py-6 text-center text-muted-foreground">
                  {q.trim() ? "No matches." : "Type to search the catalog."}
                </li>
              ) : (
                results.map((p) => (
                  <li key={p.slug}>
                    <Link
                      href={`/products/${p.slug}`}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                      onClick={() => setSearchOpen(false)}
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
                        <Image src={p.imageSrc} alt="" fill className="object-cover" sizes="40px" />
                      </div>
                      <span className="line-clamp-2">{p.name}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            {q.trim() ? (
              <div className="border-t pt-3 text-center">
                <Link
                  href={`/search?q=${encodeURIComponent(q.trim())}`}
                  className="text-sm font-medium text-[hsl(222,47%,26%)] underline-offset-4 hover:underline"
                  onClick={() => setSearchOpen(false)}
                >
                  View all results for &ldquo;{q.trim()}&rdquo;
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/40 lg:hidden",
          open ? "block" : "hidden",
        )}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        <div
          className="flex h-full w-[min(100%,20rem)] flex-col bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b p-4">
            <span className="font-semibold">Menu</span>
            <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex flex-col gap-1 p-4 text-sm font-medium">
            <Link href="/shop" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-muted">
              Shop all
            </Link>
            <Link
              href="/pages/skin-care-quiz"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-muted"
            >
              Skin quiz
            </Link>
            <HeaderSupabaseAuthDrawer onLinkClick={() => setOpen(false)} />
            <Link href="/blogs/news" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-muted">
              Blog
            </Link>
            <Link href="/pages/track-order" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-muted">
              Track order
            </Link>
            <Link href="/pages/contact" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-muted">
              Contact
            </Link>
            <Link href="/wishlist" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-muted">
              Wishlist
            </Link>
            <p className="px-3 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Brands
            </p>
            {NAV_BRANDS.map((b) => (
              <Link
                key={b.slug}
                href={`/collections/brand/${b.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-muted"
              >
                {b.label}
              </Link>
            ))}
            <Link
              href="/shop"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 font-medium text-[hsl(222,47%,26%)] hover:bg-muted"
            >
              Shop all brands
            </Link>
            <p className="px-3 pt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Concerns
            </p>
            {CONCERNS.map((c) => (
              <Link
                key={c.slug}
                href={`/collections/concern/${c.slug}`}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 hover:bg-muted"
              >
                {c.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      </>
    </HeaderSupabaseAuthProvider>
  );
}
