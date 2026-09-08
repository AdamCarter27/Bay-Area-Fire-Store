/*
 * The shape the UI renders. Nothing in here is Wix-specific on purpose: this is
 * the contract between the data source and every component that draws a
 * product. Swapping the mock data for a real catalog means writing a mapper
 * into these types, not editing the components.
 */

export type ProductVariant = {
  id: string; // Wix variant ID once live — the cart resolves purchases by it
  title: string; // e.g. size or color, "M" / "Navy"
  price: number; // in USD
  inStock: boolean; // false = sold out; the option stays visible but unbuyable
};

// Mapper lives in lib/wix/get-prod.ts (@wix/stores product → Product):
//   wixId       ← product._id
//   slug        ← product.slug
//   title       ← product.name
//   price       ← product.priceData?.price
//   image       ← product.media?.mainMedia?.image?.url
//   categories  ← collectionIds → collection names → wixCategoryMap
//   collections ← collectionIds → collection names → wixBrandMap
//   badge       ← product.ribbon, falling back to the "New Arrivals" collection
//   description ← product.description, stripped of Wix's markup
//   inStock     ← product.stock?.inStock
//   createdAt   ← product._createdDate
//   sizes       ← variant choices on a size axis, run through normalizeSize()
//   variants    ← product.variants flattened; Wix models options × choices as a
//                 matrix (size AND color), so the mapper owns that flattening
export type Product = {
  wixId: string; // Wix catalog item ID; "" for mock data. Needed for cart
  // catalogReference — slug is not accepted there.
  slug: string;
  title: string;
  price: number; // base/display price in USD
  image: string; // path under /public or remote URL; "" = use placeholder
  // Both are arrays because a Wix product belongs to many collections at once,
  // and we split those collections into two namespaces: garment categories
  // (categoryGroups.ts) and department/brand lines (brands.ts). Either may be
  // empty when a product's collections have no mapping yet.
  images: string[];
  categories: string[]; // e.g. ["hoodies"], ["tees", "youth"]
  collections: string[]; // department or brand slugs, e.g. ["sffd"]
  badge?: string; // small merchandising flag, e.g. "New", "Best seller"
  description?: string; // plain text; absent when the catalog has no copy
  inStock: boolean; // false = every variant sold out
  // When the owner created the item in Wix, ISO 8601. Absent for mock data.
  // The home page's "New drops" row sorts on this: Wix returns the catalog
  // oldest-first and won't sort on _createdDate server-side, so recency has to
  // be resolved here.
  createdAt?: string;
  // Canonical, filterable size tokens ("M", "2XL", "L/XL") derived from the
  // variant choices — the raw catalog spells the same size a half-dozen ways,
  // so the shop filter matches on this rather than on variant titles. Empty for
  // products with no size axis (stickers, coins, flags).
  sizes: string[];
  variants: ProductVariant[];
};

// Future mapper (@wix/stores collection → Collection):
//   slug  ← collection.slug
//   title ← collection.name
//   blurb ← collection.description
//   image ← collection.media?.mainMedia?.image?.url
//   kind  ← not a Wix concept; ours to assign per collection (department vs. brand)
export type Collection = {
  slug: string;
  title: string;
  kind: "department" | "brand";
  blurb: string;
  image: string; // owner-supplied; "" = placeholder
};
