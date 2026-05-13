import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SITE } from "@/config/store";

export const metadata = {
  title: "Blog",
  description: "Skincare news and tips from Totality Skincare.",
};

export default function BlogNewsHubPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Blog</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">News &amp; skincare tips</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Articles still live on the Shopify-hosted blog at the same public URL your customers already
        use. Open it below; when you migrate content, replace this page with MDX or a CMS route.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="blush" size="lg">
          <a href={SITE.legacyBlogNewsUrl} target="_blank" rel="noreferrer">
            Open blog (totality-skincare.com)
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/shop">Shop products</Link>
        </Button>
      </div>
    </main>
  );
}
