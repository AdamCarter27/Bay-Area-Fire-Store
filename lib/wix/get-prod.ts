import { wixClient, getWixCollectionMap } from "@/lib/wix/client";
import type { Product, ProductVariant } from "@/lib/data/types";
import { wixCategoryMap, wixBrandMap } from "@/lib/wix/collection-mapping";

/*
 * Maps the live Wix catalog into the UI's Product contract (lib/data/types.ts).
 *
 * A Wix product carries a flat list of collection IDs with no notion of what
 * kind of collection each one is. We resolve those IDs to names, then split the
 * names across two namespaces via collection-mapping.ts: garment categories
 * (categoryGroups.ts) and department/brand lines (brands.ts). A name absent
 * from both maps is dropped, so an unmapped Wix collection makes a product
 * unreachable through that filter rather than breaking the page.
 */

// Wix caps a query page at 100 items and `find()` returns only the first page.
const PAGE_SIZE = 100;

/*
 * Fallback for products the store never filed under a garment collection.
 * Roughly a third of the live catalog sits in a brand collection ("Fire
 * Nuggets") and nothing else, which leaves no category to filter on even
 * though the title says plainly what the item is. Titles are merchandising
 * copy, not structured data, so this is a guess and can misfile — it only
 * runs when the collections gave us nothing, and it stops firing on its own
 * once the owner files products correctly in Wix.
 *
 * Order matters: first match wins, so narrower patterns come first ("long
 * sleeve t-shirt" should land on long-sleeves, not tees).
 */
const TITLE_CATEGORY_HINTS: [RegExp, string][] = [
  [/\blong[- ]sleeve/i, "long-sleeves"],
  [/\bcrewneck|\bsweatshirt|\bhoodie|\bhooded\b/i, "sweatshirts"],
  [/\bsweatpant|\bjogger/i, "sweatpants"],
  [/\btank top|\btank\b/i, "tank-tops"],
  [/\bt-?shirt|\btee\b/i, "tees"],
  // Bare "Shirt" is a tee at this store (fundraiser and event shirts).
  // Safe below the patterns above: \b prevents matching inside "sweatshirt".
  [/\bshirt\b/i, "tees"],
  [/\bbeanie/i, "beanies"],
  [/\bsnapback|\bdad hat\b|\bhat\b|\bcap\b/i, "hats"],
  [/\bjacket|\bvest\b/i, "jackets"],
  [/\bsticker/i, "stickers"],
  [/\bchallenge coin|\bcoin\b/i, "challenge-coins"],
  [/\bflag\b/i, "custom-fire-flags"],
  [/\bhelmet/i, "leather-helmets"],
];

function inferCategories(title: string): string[] {
  const hit = TITLE_CATEGORY_HINTS.find(([pattern]) => pattern.test(title));
  return hit ? [hit[1]] : [];
}

export async function getWixProducts(): Promise<Product[]> {
  const [items, collectionMap] = await Promise.all([
    queryAllProducts(),
    getWixCollectionMap(),
  ]);

  return items.map((p): Product => {
    const collectionNames = (p.collectionIds ?? [])
      .map((id: string) => collectionMap[id])
      .filter(Boolean);

    const mappedCategories = collectionNames
      .map((name: string) => wixCategoryMap[name])
      .filter(Boolean);

    const collections = collectionNames
      .map((name: string) => wixBrandMap[name])
      .filter(Boolean);

    const title = p.name ?? "";

    return {
      wixId: p._id ?? "",
      slug: p.slug ?? "",
      title,
      price: p.priceData?.price ?? 0,
      image: p.media?.mainMedia?.image?.url ?? "",
      // Real collection data always wins; the title guess only fills holes.
      categories:
        mappedCategories.length > 0 ? mappedCategories : inferCategories(title),
      collections,
      badge: p.ribbon || undefined,
      variants: mapVariants(p),
    };
  });
}

async function queryAllProducts() {
  const all = [];
  let page = await wixClient.products.queryProducts().limit(PAGE_SIZE).find();

  while (true) {
    all.push(...page.items);
    if (!page.hasNext()) break;
    page = await page.next();
  }

  return all;
}

// Wix models options as a matrix (size AND color); the UI's single axis is the
// flattened combination, e.g. "M / Navy". Variant IDs matter — the cart's
// catalogReference resolves a purchase by them, not by title.
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
