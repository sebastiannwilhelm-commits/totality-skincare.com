import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { CookieConsent } from "@/components/cookie-consent";
import { LeadCapturePopup } from "@/components/lead-capture-popup";
import { FirebasePublicBootstrap } from "@/components/firebase-public-bootstrap";
import { SupabasePublicBootstrap } from "@/components/supabase-public-bootstrap";
import { getFirebasePublicEnv } from "@/lib/firebase/public-env";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { SITE } from "@/config/store";
import { getSupabasePublicEnv } from "@/lib/supabase/public-env";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});

function resolveMetadataBase(): URL {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw) {
    try {
      return new URL(raw);
    } catch {
      /* ignore */
    }
  }
  return new URL("http://localhost:3000");
}

/** Read Firebase/Supabase public env at request time so bootstrap props are not baked in as empty at build. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: `${SITE.name} | Medical-grade skincare`,
    template: `%s | ${SITE.name}`,
  },
  description:
    "Medical-grade and prescription skincare curated by Dr. Nicole Nadel — same experience as totality-skincare.com, rebuilt on Next.js + Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabasePublic = getSupabasePublicEnv();
  const firebasePublic = getFirebasePublicEnv();

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} min-h-screen bg-background font-sans antialiased`}
      >
        {firebasePublic ? <FirebasePublicBootstrap {...firebasePublic} /> : null}
        {supabasePublic ? (
          <SupabasePublicBootstrap url={supabasePublic.url} anonKey={supabasePublic.anonKey} />
        ) : null}
        <CartProvider>
          <WishlistProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CookieConsent />
            <LeadCapturePopup />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
