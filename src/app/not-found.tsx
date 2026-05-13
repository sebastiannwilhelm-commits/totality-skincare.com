import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-4 py-20 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Page not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        That URL isn&apos;t in this storefront yet. Try the shop or return home.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="blush">
          <Link href="/shop">Shop all</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}
