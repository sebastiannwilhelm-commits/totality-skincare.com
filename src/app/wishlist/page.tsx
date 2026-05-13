import Link from "next/link";

import { WishlistClient } from "./wishlist-client";

export const metadata = {
  title: "Wishlist",
};

export default function WishlistPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Wishlist</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Wishlist</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Saved on this device (like a lightweight Flits wishlist). After Supabase Auth ships, migrate
        saved slugs to per-account rows.
      </p>
      <WishlistClient />
    </main>
  );
}
