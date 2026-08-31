/*
 * The availability snapshot the cart needs to flag sold-out lines.
 *
 * The cart lives in localStorage and holds whatever stock state was true when
 * an item was added — which can be days old, and 22% of the catalog is sold
 * out at any given time. Wix does reject an unavailable line item when the
 * checkout is created, but that arrives as one opaque failure at the last
 * step, with no indication of which item caused it. Better to say so on the
 * cart page while the shopper can still act on it.
 *
 * Keyed by slug because that (plus variantId) is what CartItem carries.
 */

import type { Product } from "./types";

export type CartStock = Record<
  string,
  {
    /** False when every variant is sold out. */
    inStock: boolean;
    /** variantId → still buyable. */
    variants: Record<string, boolean>;
  }
>;

export function buildCartStock(products: Product[]): CartStock {
  const stock: CartStock = {};

  for (const product of products) {
    stock[product.slug] = {
      inStock: product.inStock,
      variants: Object.fromEntries(
        product.variants.map((variant) => [variant.id, variant.inStock])
      ),
    };
  }

  return stock;
}

/*
 * A cart line is unavailable when the product is gone from the catalog
 * entirely, when every variant is sold out, or when this specific variant is.
 * An unknown slug or variant counts as unavailable rather than available: the
 * catalog is the authority, and guessing "still buyable" here just moves the
 * failure to Wix's checkout where it is harder to explain.
 */
export function isCartItemUnavailable(
  stock: CartStock,
  item: { slug: string; variantId: string }
): boolean {
  const entry = stock[item.slug];
  if (!entry || !entry.inStock) return true;

  const variantInStock = entry.variants[item.variantId];
  return variantInStock !== true;
}
