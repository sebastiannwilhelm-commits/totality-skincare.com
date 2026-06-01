import Link from "next/link";

import { LEGACY_STORE_URL, SITE } from "@/config/store";

import { NewsletterForm } from "./newsletter-form";

export function SiteFooter() {
  return (
    <footer className="border-t bg-[hsl(350,40%,98%)] pb-28">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-[hsl(222,47%,18%)]">
              GET ON THE LIST
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Sign up to get the latest on sales, new releases and more …
            </p>
            <NewsletterForm className="mt-6 max-w-md" />
            <div className="mt-8 flex gap-4 text-sm">
              <a
                href={SITE.facebook}
                className="text-muted-foreground hover:text-[hsl(222,47%,18%)] hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
              <a
                href={SITE.instagram}
                className="text-muted-foreground hover:text-[hsl(222,47%,18%)] hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <a
                href={`mailto:${SITE.contactEmail}`}
                className="text-muted-foreground hover:text-[hsl(222,47%,18%)] hover:underline"
              >
                Email
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                About
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {SITE.name} is a leading provider in skincare products. All our product lines are
                selected by Dr. Nadel.
              </p>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Resources
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/shop" className="hover:underline">
                    Skincare Lines
                  </Link>
                </li>
                <li>
                  <a
                    href={SITE.legacyRewardsUrl}
                    className="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    My Rewards
                  </a>
                </li>
                <li>
                  <a
                    href={`${LEGACY_STORE_URL}/collections/gift-cards`}
                    className="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Collection &amp; Gift Cards
                  </a>
                </li>
                <li>
                  <a
                    href={`${LEGACY_STORE_URL}/pages/about-us`}
                    className="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a href={SITE.legacyBlogNewsUrl} className="hover:underline" target="_blank" rel="noreferrer">
                    Totality Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Support
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/pages/contact" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href={SITE.policies.refund} className="hover:underline" target="_blank" rel="noreferrer">
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a href={SITE.policies.privacy} className="hover:underline" target="_blank" rel="noreferrer">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href={SITE.policies.terms} className="hover:underline" target="_blank" rel="noreferrer">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href={SITE.legacyOrderTrackingUrl}
                    className="hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Track an Order
                  </a>
                </li>
                <li>
                  <Link href="/pages/track-order" className="text-muted-foreground hover:underline">
                    New storefront orders
                  </Link>
                </li>
              </ul>
              <h3 className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Us
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href={`mailto:${SITE.contactEmail}`} className="hover:underline">
                    Email: {SITE.contactEmail}
                  </a>
                </li>
                <li>
                  <a href={SITE.phoneTel} className="hover:underline">
                    Phone: {SITE.phoneDisplay}
                  </a>
                </li>
                {SITE.faxDisplay ? (
                  <li>Fax: {SITE.faxDisplay}</li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-[hsl(350,30%,90%)] bg-white/80">
        <div className="mx-auto max-w-6xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          <p>© {new Date().getFullYear()} {SITE.copyrightName}.</p>
        </div>
      </div>
    </footer>
  );
}
