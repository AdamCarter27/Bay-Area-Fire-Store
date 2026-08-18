import { wixClient } from "@/lib/wix/client";
import type { Product, ProductVariant } from "@/lib/data/products";
import { wixCategoryMap, wixBrandMap } from "@/lib/wix/collection-mapping";


// Temporary type while lib/data/products.ts still uses the old
// category/collection singular shape. Once that file is updated to
// arrays, this can be deleted and WixProduct swapped back to Product.
export type WixProduct = {
  slug: string;
  title: string;
  price: number;
  image: string;
  categories: string[];
  collections: string[];
  badge?: string;
  variants: ProductVariant[];
};

export async function getWixCollectionMap(): Promise<Record<string, string>> {
  const { items } = await wixClient.collections.queryCollections().find();
  const map: Record<string, string> = {};
  for (const c of items) {
    if (c._id && c.name) map[c._id] = c.name;
  }
  return map;
}

export async function getWixProducts(): Promise<WixProduct[]> {
  const [{ items }, collectionMap] = await Promise.all([
    wixClient.products.queryProducts().find(),
    getWixCollectionMap(),
  ]);

  return items.map((p): WixProduct => {
    const collectionNames = (p.collectionIds ?? [])
      .map((id: string) => collectionMap[id])
      .filter(Boolean);

    const categories = collectionNames
      .map((name: string) => wixCategoryMap[name])
      .filter(Boolean);

    const collections = collectionNames
      .map((name: string) => wixBrandMap[name])
      .filter(Boolean);

    return {
      slug: p.slug ?? "",
      title: p.name ?? "",
      price: p.priceData?.price ?? 0,
      image: p.media?.mainMedia?.image?.url ?? "",
      categories,
      collections,
      badge: p.ribbon || undefined,
      variants: mapVariants(p),
    };
  });
}

function mapVariants(p: any): ProductVariant[] {
  if (!p.manageVariants || !p.variants || p.variants.length === 0) {
    return [{ id: "one-size", title: "One size", price: p.priceData?.price ?? 0 }];
  }

  return p.variants.map((v: any) => {
    const choiceValues = Object.values(v.choices ?? {}) as string[];
    return {
      id: v._id ?? "",
      title: choiceValues.length > 0 ? choiceValues.join(" / ") : "One size",
      price: v.variant?.priceData?.price ?? p.priceData?.price ?? 0,
    };
  });
}