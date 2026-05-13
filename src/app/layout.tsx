import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import { CookieConsent } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/context/cart-context";
import { WishlistProvider } from "@/context/wishlist-context";
import { SITE } from "@/config/store";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
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
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${cormorant.variable} min-h-screen bg-background font-sans antialiased`}
      >
        <CartProvider>
          <WishlistProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
            <CookieConsent />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
