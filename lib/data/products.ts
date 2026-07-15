// Mock product data. Structured to mirror a future Shopify data source so the
// UI can swap to a real backend without shape changes.

export type ProductVariant = {
  id: string;
  title: string; // e.g. size or color, "M" / "Navy"
  price: number; // in USD
};

export type Product = {
  slug: string;
  title: string;
  price: number; // base/display price in USD
  image: string; // path under /public or remote URL
  category: string; // e.g. "headwear", "hoodies", "tees"
  variants: ProductVariant[];
};

export const products: Product[] = [];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
