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
};

// Mapper lives in lib/wix/get-prod.ts (@wix/stores product → Product):
//   wixId       ← product._id
//   slug        ← product.slug
//   title       ← product.name
//   price       ← product.priceData?.price
//   image       ← product.media?.mainMedia?.image?.url
//   categories  ← collectionIds → collection names → wixCategoryMap
//   collections ← collectionIds → collection names → wixBrandMap
//   badge       ← product.ribbon
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
  categories: string[]; // e.g. ["hoodies"], ["tees", "youth"]
  collections: string[]; // department or brand slugs, e.g. ["sffd"]
  badge?: string; // small merchandising flag, e.g. "New", "Best seller"
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
