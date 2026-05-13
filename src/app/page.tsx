import {
  BestSellersSection,
  HomeHero,
  PromoBar,
  TrustShippingStrip,
} from "@/components/home/hero-sections";
import {
  FounderSection,
  ShopByBrandSection,
  ShopByConcernSection,
  TestimonialsSection,
} from "@/components/home/marketing-sections";

export default function HomePage() {
  return (
    <main>
      <PromoBar />
      <TrustShippingStrip />
      <HomeHero />
      <BestSellersSection />
      <ShopByBrandSection />
      <ShopByConcernSection />
      <TestimonialsSection />
      <FounderSection />
    </main>
  );
}
