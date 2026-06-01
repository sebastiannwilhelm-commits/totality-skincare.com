import { ProductCard } from "@/components/home/product-grid";
import { productsByBrand } from "@/config/store";
import type { StoreProduct } from "@/lib/types";

type RelatedProductsSectionProps = {
  product: StoreProduct;
  limit?: number;
};

export function RelatedProductsSection({ product, limit = 4 }: RelatedProductsSectionProps) {
  const related = productsByBrand(product.brand)
    .filter((p) => p.slug !== product.slug)
    .slice(0, limit);

  if (related.length === 0) return null;

  return (
    <section className="mt-16 border-t pt-12">
      <h2 className="text-center text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
        Complete your beauty routine
      </h2>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {related.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
}
