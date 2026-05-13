import { BestSellersSection } from "@/components/home/product-grid";
import { HomeHero, PromoBar, TrustShippingStrip } from "@/components/home/hero-sections";
import {
  FounderSection,
  ShopByBrandSection,
  ShopByConcernSection,
  TestimonialsSection,
} from "@/components/home/marketing-sections";
import { RecentlyViewedSection } from "@/components/recently-viewed-section";

export default function HomePage() {
  return (
    <main>
      <PromoBar />
      <TrustShippingStrip />
      <HomeHero />
      <BestSellersSection />
      <ShopByBrandSection />
      <ShopByConcernSection />
      <RecentlyViewedSection />
      <TestimonialsSection />
      <FounderSection />
    </main>
  );
}
