export type ConcernSlug =
  | "acne"
  | "oily"
  | "sensitive"
  | "dryness"
  | "anti-aging"
  | "brightening";

export type StoreProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: "usd";
  brand: string;
  concerns: ConcernSlug[];
  imageSrc: string;
  isPrescriptionRequired: boolean;
  /** When true, show “notify me” style CTA instead of add-to-cart (inventory 0 on live). */
  comingSoon?: boolean;
};

export type CartLine = {
  slug: string;
  quantity: number;
};
