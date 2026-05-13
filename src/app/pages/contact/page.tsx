import Link from "next/link";

import { ContactForm } from "@/components/contact-form";
import { SITE } from "@/config/store";

export const metadata = {
  title: "Contact",
  description: "Contact Totality Skincare.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <nav className="text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Contact</span>
      </nav>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-[hsl(222,47%,18%)]">Contact us</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Prefer email? Reach us at{" "}
        <a
          className="font-medium text-foreground underline-offset-4 hover:underline"
          href={`mailto:${SITE.contactEmail}`}
        >
          {SITE.contactEmail}
        </a>{" "}
        or call{" "}
        <a className="font-medium text-foreground underline-offset-4 hover:underline" href={SITE.phoneTel}>
          {SITE.phoneDisplay}
        </a>
        .
      </p>
      <ContactForm />
    </main>
  );
}
