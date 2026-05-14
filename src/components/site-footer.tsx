import Link from "next/link";

import { BRANDS, CONCERNS, SITE } from "@/config/store";

import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  return (
    <footer className="border-t bg-[hsl(350,40%,98%)] pb-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[hsl(222,47%,18%)]">
            GET ON THE LIST
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Sign up to get the latest on sales, new releases and more — same promise as the live
            storefront.
          </p>
          <NewsletterForm className="mt-6 max-w-md" />
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shop
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/shop" className="hover:underline">
                  All products
                </Link>
              </li>
              <li>
                <Link href="/pages/skin-care-quiz" className="hover:underline">
                  Skin care quiz
                </Link>
              </li>
              <li>
                <Link href="/blogs/news" className="hover:underline">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:underline">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/pages/track-order" className="hover:underline">
                  Track order
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="hover:underline">
                  Subscribe &amp; save
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:underline">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/admin/leads" className="hover:underline">
                  Leads (admin)
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Customer care
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/pages/contact" className="hover:underline">
                  Contact us
                </Link>
              </li>
              <li>
                <a href={`mailto:${SITE.contactEmail}`} className="hover:underline">
                  {SITE.contactEmail}
                </a>
              </li>
              <li>
                <a href={SITE.phoneTel} className="hover:underline">
                  {SITE.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={SITE.policies.refund} className="hover:underline" target="_blank" rel="noreferrer">
                  Refund policy
                </a>
              </li>
              <li>
                <a href={SITE.policies.shipping} className="hover:underline" target="_blank" rel="noreferrer">
                  Shipping policy
                </a>
              </li>
              <li>
                <a href={SITE.policies.privacy} className="hover:underline" target="_blank" rel="noreferrer">
                  Privacy policy
                </a>
              </li>
              <li>
                <a href={SITE.policies.terms} className="hover:underline" target="_blank" rel="noreferrer">
                  Terms of service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Brands
            </h3>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {BRANDS.map((b) => (
                <li key={b.slug}>
                  <Link href={`/collections/brand/${b.slug}`} className="hover:underline">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Concerns
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {CONCERNS.map((c) => (
                <li key={c.slug}>
                  <Link href={`/collections/concern/${c.slug}`} className="hover:underline">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-[hsl(350,30%,90%)] bg-white/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {SITE.name}. Palmetto Developments storefront (replacing Shopify).</p>
          <div className="flex gap-4">
            <a href={SITE.instagram} className="hover:underline" target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={SITE.facebook} className="hover:underline" target="_blank" rel="noreferrer">
              Facebook
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
