import Link from "next/link";

import { LEGACY_STORE_URL } from "@/config/store";

type ProductPurchaseOptionsProps = {
  slug: string;
  showSubscribe?: boolean;
};

/** Mirrors live “One-time purchase” vs “Subscribe and save” on Shopify PDPs. */
export function ProductPurchaseOptions({ slug, showSubscribe = true }: ProductPurchaseOptionsProps) {
  if (!showSubscribe) return null;

  const legacyPdp = `${LEGACY_STORE_URL}/products/${slug}`;

  return (
    <div className="mt-6 space-y-3 rounded-lg border bg-[hsl(350,40%,98%)] p-4 text-sm">
      <p className="font-semibold text-[hsl(222,47%,18%)]">Purchase options</p>
      <label className="flex cursor-default items-start gap-3">
        <input type="radio" name="purchase-option" defaultChecked className="mt-1" readOnly />
        <span>
          <span className="font-medium">One-time purchase</span>
          <span className="mt-0.5 block text-muted-foreground">Add to cart below</span>
        </span>
      </label>
      <label className="flex items-start gap-3">
        <input type="radio" name="purchase-option" className="mt-1" readOnly />
        <span>
          <span className="font-medium">Subscribe and save</span>
          <span className="mt-0.5 block text-muted-foreground">
            Managed on the live store until subscription checkout ships here.{" "}
            <Link
              href={legacyPdp}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[hsl(222,47%,26%)] underline-offset-4 hover:underline"
            >
              Subscribe on totality-skincare.com
            </Link>
          </span>
        </span>
      </label>
      <p className="text-xs text-muted-foreground">
        Or explore our{" "}
        <Link href="/subscribe" className="underline-offset-4 hover:underline">
          subscription box
        </Link>
        .
      </p>
    </div>
  );
}
