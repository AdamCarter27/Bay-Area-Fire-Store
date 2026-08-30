import { wixClient } from "@/lib/wix/client";
import type { Product, ProductVariant } from "@/lib/data/types";

const STICKER_PRODUCT_SLUG = "custom-sticker";

let cached: Product | null = null;

/**
 * Fetches the real "Custom Stickers" Wix product (created in the dashboard
 * with one variant per quantity tier). Cached in memory per page load since
 * it never changes mid-session and the sticker form may call this more than
 * once.
 */
export async function getStickerProduct(): Promise<Product | null> {
  if (cached) return cached;

  const { items } = await wixClient.products
    .queryProducts()
    .eq("slug", STICKER_PRODUCT_SLUG)
    .find();
  console.log("[sticker-order] product query returned:", items.length, "items");
  console.log("[sticker-order] slugs found:", items.map(i => i.slug));
  const p = items[0];
  if (!p) return null;

    const variants: ProductVariant[] = (p.variants ?? []).map((v) => {
    const choiceValues = Object.values(v.choices ?? {}) as string[];
    return {
      id: v._id ?? "",
      title: choiceValues.join(" / "),
      price: v.variant?.priceData?.price ?? p.priceData?.price ?? 0,
      inStock: v.stock?.inStock ?? true,
    };
  });

  cached = {
    wixId: p._id ?? "",
    slug: p.slug ?? "",
    title: p.name ?? "",
    price: p.priceData?.price ?? 0,
    image: p.media?.mainMedia?.image?.url ?? "",
    categories: [],
    collections: [],
    badge: undefined,
    description: undefined,
    inStock: p.stock?.inStock ?? true,
    sizes: [],
    variants,
  };

  return cached;
}

/**
 * Matches a chosen quantity (25, 50, 100…) to its Wix variant by checking
 * whether the variant's choice text contains that number — e.g. quantity 25
 * matches a variant titled "25 stickers". Depends on the dashboard's variant
 * choice labels actually containing the number as typed.
 */
export function findStickerVariant(
  product: Product,
  quantity: number
): ProductVariant | undefined {
  console.log("[sticker-order] variants:", JSON.stringify(product.variants, null, 2));
  console.log("[sticker-order] looking for quantity:", quantity);
  return product.variants.find((v) => v.title.includes(String(quantity)));
}