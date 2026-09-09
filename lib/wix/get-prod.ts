import type { products as wixProducts } from "@wix/stores";
import { wixClient, getWixCollectionMap } from "@/lib/wix/client";
import type {
  Product,
  ProductCustomTextField,
  ProductOption,
  ProductVariant,
} from "@/lib/data/types";
import { wixCategoryMap, wixBrandMap } from "@/lib/wix/collection-mapping";
import {
  isSizeAxis,
  normalizeSize,
  sortSizes,
  isFittedHatSize,
} from "@/lib/wix/size-normalize";

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
 * The variant ID we invent for products whose variants Wix doesn't manage, so
 * the UI always has something to select. It is NOT a real Wix variant — the
 * checkout mapper has to strip it rather than send it on (see
 * lib/wix/checkout.ts), or eCommerce rejects the whole order.
 */
export const ONE_SIZE_VARIANT_ID = "one-size";

type WixProduct = wixProducts.Product;

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

// The collection whose products get the "New" badge. Nothing in the live
// catalog carries a Wix ribbon, so without this fallback no product on the
// site would ever show a merchandising flag.
const NEW_ARRIVALS_COLLECTION = "New Arrivals";

export async function getWixProducts(): Promise<Product[]> {
  const [items, collectionMap] = await Promise.all([
    queryAllProducts(),
    getWixCollectionMap(),
  ]);

  warnAboutUnmappedCollections(collectionMap);

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

    // Real collection data always wins; the title guess only fills holes.
    const categories =
      mappedCategories.length > 0 ? mappedCategories : inferCategories(title);

    // Computed once here so mapVariants/mapSizes use the same resolved
    // categories as the rest of the product, instead of re-deriving a guess
    // from the title themselves.
    const variants = mapVariants(p, categories);
    const options = mapOptions(p, categories);
    const images = (p.media?.items ?? []).map((item) => capImageSize(item.image?.url ?? "")).filter(Boolean);

    return {
      wixId: p._id ?? "",
      slug: p.slug ?? "",
      title,
      price: p.priceData?.price ?? 0,
      image: capImageSize(p.media?.mainMedia?.image?.url ?? ""),
      images: images.length > 0 ? images : [capImageSize(p.media?.mainMedia?.image?.url ?? "")],
      categories,
      collections,
      badge:
        p.ribbon ||
        (collectionNames.includes(NEW_ARRIVALS_COLLECTION) ? "New" : undefined),
      description: stripHtml(p.description ?? "") || undefined,
      inStock: p.stock?.inStock ?? true,
      createdAt: p._createdDate ? new Date(p._createdDate).toISOString() : undefined,
      sizes: mapSizes(p, categories),
      variants,
      options,
      customTextFields: mapCustomTextFields(p),
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

/*
 * A hat's variants only represent real, sellable size differences when at
 * least one choice normalizes to a genuine fitted measurement (7, 7 1/8, …).
 * Snapback/adjustable hats sometimes carry a stray "Regular"/"X-Large" size
 * option in Wix (leftover from being cloned off a fitted-hat template) even
 * though there's only one physical item — those collapse to a single variant.
 */
function hasRealHatSizeDifference(p: WixProduct): boolean {
  return (p.variants ?? []).some((v) =>
    Object.entries(v.choices ?? {}).some(([key, value]) => {
      if (!isSizeAxis(key) || typeof value !== "string") return false;
      const token = normalizeSize(value, key);
      return token ? isFittedHatSize(token) : false;
    })
  );
}

function collapseVariants(
  p: WixProduct,
  categories: string[]
): NonNullable<WixProduct["variants"]> {
  const variants = p.variants ?? [];
  const isHat = categories.includes("hats");
  if (isHat && !hasRealHatSizeDifference(p)) return [];
  return variants;
}

// Wix models options as a matrix (size AND color); the UI's single axis is the
// flattened combination, e.g. "M / Navy". Variant IDs matter — the cart's
// catalogReference resolves a purchase by them, not by title.
function mapVariants(p: WixProduct, categories: string[]): ProductVariant[] {
  const variants = collapseVariants(p, categories);

  if (!p.manageVariants || variants.length === 0) {
    /*
     * Collapsing is a display decision — an adjustable snapback shouldn't show
     * a size picker — but the line item underneath still has to name a real
     * Wix variant. Send a managed product to checkout without one and Wix
     * can't resolve it: the line comes back with no name and the order totals
     * $0. So when Wix does manage this product's variants, carry the first
     * in-stock one's ID while still labelling it "One size".
     */
    const underlying =
      (p.variants ?? []).find((v) => v.stock?.inStock) ?? (p.variants ?? [])[0];
    const realId = p.manageVariants ? underlying?._id : undefined;

    return [
      {
        id: realId || ONE_SIZE_VARIANT_ID,
        title: "One size",
        price:
          underlying?.variant?.priceData?.price ?? p.priceData?.price ?? 0,
        // An unmanaged product has no per-variant stock, only the product's.
        inStock: p.stock?.inStock ?? true,
      },
    ];
  }

  return variants.map((v) => {
    const choices = toChoiceMap(v.choices);
    const choiceValues = Object.values(choices);
    return {
      id: v._id ?? "",
      title: choiceValues.length > 0 ? choiceValues.join(" / ") : "One size",
      price: v.variant?.priceData?.price ?? p.priceData?.price ?? 0,
      inStock: v.stock?.inStock ?? true,
      ...(choiceValues.length > 0 ? { choices } : {}),
    };
  });
}

// Wix types a variant's choices loosely (numbers and nulls turn up); the UI
// matches choices to option labels by string equality, so anything that isn't
// a string is dropped rather than coerced into a label nothing will match.
function toChoiceMap(
  choices: Record<string, unknown> | undefined | null
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(choices ?? {}).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string"
    )
  );
}

/*
 * The option axes the PDP renders a picker for — "Size", "Color", "Name
 * Embroidery". Wix keeps these separately from the variants, so this pairs
 * them up: an axis is only offered when the variants actually carry a choice
 * on it, which keeps a stale option left over in the Wix dashboard from
 * drawing a picker that can never resolve to a variant.
 *
 * A color choice is stored as a hex value with the human name in
 * `description` ("#000080" / "Navy"), and variants reference the name — so the
 * description is what has to come through here.
 */
function mapOptions(
  p: WixProduct,
  categories: string[]
): ProductOption[] | undefined {
  const variants = collapseVariants(p, categories);
  if (!p.manageVariants || variants.length === 0) return undefined;

  const options = (p.productOptions ?? [])
    .map((option) => {
      const name = option.name ?? "";
      const inVariants = new Set(
        variants
          .map((v) => toChoiceMap(v.choices)[name])
          .filter((choice): choice is string => Boolean(choice))
      );

      return {
        name,
        choices: (option.choices ?? [])
          .map((choice) => choice.description ?? choice.value ?? "")
          .filter((choice) => inVariants.has(choice)),
      };
    })
    .filter((option) => option.name && option.choices.length > 0);

  return options.length > 0 ? options : undefined;
}

/*
 * The free-text fields Wix requires on a product (embroidery copy, the name to
 * stitch). Carried through the UI because eCommerce silently discards a line
 * item whose mandatory fields are missing — see lib/wix/checkout.ts.
 */
function mapCustomTextFields(
  p: WixProduct
): ProductCustomTextField[] | undefined {
  const fields = (p.customTextFields ?? [])
    .filter((field) => field.title)
    .map((field) => ({
      title: field.title!,
      mandatory: field.mandatory ?? false,
      // Wix's own default when the owner leaves the limit blank.
      maxLength: field.maxLength ?? 500,
    }));

  return fields.length > 0 ? fields : undefined;
}

/*
 * Canonical size tokens for the shop filter. Only choices on a size axis count
 * — a product with Color and Embroidery options but no size contributes none,
 * which is correct: it has nothing to filter by.
 */
function mapSizes(p: WixProduct, categories: string[]): string[] {
  const tokens = new Set<string>();

  for (const v of collapseVariants(p, categories)) {
    for (const [key, value] of Object.entries(v.choices ?? {})) {
      if (!isSizeAxis(key) || typeof value !== "string") continue;
      const token = normalizeSize(value, key);
      if (token) tokens.add(token);
    }
  }

  return sortSizes([...tokens]);
}

/*
 * Wix serves product photos at whatever resolution the owner uploaded —
 * routinely 4032×3024 camera originals — but its media CDN honors the resize
 * params embedded in the URL path (".../v1/fit/w_4032,h_3024,q_90/file.jpg").
 * Capping them here means next/image transforms from a ~200KB source instead
 * of downloading a multi-MB original per size × format. 1200×1500 covers the
 * largest rendered slot (the PDP at ~45vw). Unrecognized URL shapes pass
 * through untouched — a full-size image is slow, a broken one is worse.
 */
const IMAGE_PARAMS_RE = /\/v1\/(fit|fill)\/w_\d+,h_\d+(,[^/]*)?\//;

function capImageSize(url: string): string {
  if (!IMAGE_PARAMS_RE.test(url)) return url;
  return url.replace(IMAGE_PARAMS_RE, "/v1/$1/w_1200,h_1500,q_80/");
}

// Wix descriptions come back as rich-text markup; the PDP renders plain text.
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * A Wix collection with no entry in either map silently drops its products out
 * of the corresponding filter, which looks like missing inventory rather than
 * missing configuration. Loud in dev, silent in production.
 */
function warnAboutUnmappedCollections(collectionMap: Record<string, string>) {
  if (process.env.NODE_ENV === "production") return;

  const unmapped = Object.values(collectionMap).filter(
    (name) => name !== "All Products" && !wixCategoryMap[name] && !wixBrandMap[name]
  );

  if (unmapped.length > 0) {
    console.warn(
      `[wix] ${unmapped.length} collection(s) not in collection-mapping.ts, ` +
        `so their products are unreachable through that filter: ${unmapped.join(", ")}`
    );
  }
}