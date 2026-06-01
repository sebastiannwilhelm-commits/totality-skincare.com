import { LEGACY_STORE_URL } from "@/config/store";

const CDN = `${LEGACY_STORE_URL}/cdn/shop/files`;

/** Curated homepage brand logos — matches totality-skincare.com “Shop by brands” section. */
export const FEATURED_BRANDS: {
  slug: string;
  label: string;
  logoSrc: string;
  /** Use legacy Shopify collection when our brand route slug differs. */
  legacyCollection?: string;
}[] = [
  { slug: "amika", label: "Amika", logoSrc: `${CDN}/Amika_2000x.png?v=1700476514` },
  { slug: "avenova", label: "Avenova", logoSrc: `${CDN}/Avenova_2000x.png?v=1700476927` },
  {
    slug: "butter-london",
    label: "Butter London",
    logoSrc: `${CDN}/Butter-London_2000x.png?v=1700476977`,
  },
  { slug: "clarity-rx", label: "Clarity RX", logoSrc: `${CDN}/ClarityRX_2000x.png?v=1700476977` },
  {
    slug: "colorescience",
    label: "Colorescience",
    logoSrc: `${CDN}/Colorescience_2000x.png?v=1700476976`,
  },
  { slug: "cosmedix", label: "Cosmedix", logoSrc: `${CDN}/Cosmedix_2000x.png?v=1700476977` },
  {
    slug: "dermalogica",
    label: "Dermalogica",
    logoSrc: `${CDN}/Dermalogica_2000x.png?v=1700476976`,
  },
  { slug: "eltamd", label: "EltaMD", logoSrc: `${CDN}/EltaMD_2000x.png?v=1700476977` },
  { slug: "epionce", label: "Epionce", logoSrc: `${CDN}/Epionce_2000x.png?v=1700476977` },
  {
    slug: "factorfive",
    label: "FactorFive",
    logoSrc: `${CDN}/FactorFive_2000x.png?v=1700476977`,
    legacyCollection: "factorfive",
  },
  {
    slug: "glo-skin-beauty",
    label: "GLO Skin Beauty",
    logoSrc: `${CDN}/GLO_2000x.png?v=1700476977`,
    legacyCollection: "glo-skin-beauty",
  },
  {
    slug: "glymed-plus",
    label: "GlyMed Plus",
    logoSrc: `${CDN}/Glymed_2000x.png?v=1700476977`,
  },
  {
    slug: "haleys",
    label: "Haleys",
    logoSrc: `${CDN}/Haleys_2000x.png?v=1700476977`,
    legacyCollection: "haleys",
  },
  { slug: "hydrinity", label: "Hydrinity", logoSrc: `${CDN}/Hydrinity_2000x.png?v=1700476977` },
];

/** Primary brands in header nav — matches totality-skincare.com mega-menu highlights. */
export const NAV_BRANDS: { slug: string; label: string }[] = [
  { slug: "obagi", label: "Obagi" },
  { slug: "skinceuticals", label: "SkinCeuticals" },
  { slug: "upneeq", label: "UPNEEQ" },
  { slug: "eltamd", label: "EltaMD" },
  { slug: "skinmedica", label: "SkinMedica" },
  { slug: "isclinical", label: "isClinical" },
  { slug: "zo-skin", label: "ZO Skin Health" },
  { slug: "glymed-plus", label: "GlyMed Plus" },
  { slug: "dermalogica", label: "Dermalogica" },
  { slug: "colorescience", label: "Colorescience" },
];

export function featuredBrandHref(brand: (typeof FEATURED_BRANDS)[number]): string {
  if (brand.legacyCollection) {
    return `${LEGACY_STORE_URL}/collections/${brand.legacyCollection}`;
  }
  return `/collections/brand/${brand.slug}`;
}
