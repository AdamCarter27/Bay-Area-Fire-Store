/*
 * The shape the UI renders. Nothing in here is Wix-specific on purpose: this is
 * the contract between the data source and every component that draws a
 * product. Swapping the mock data for a real catalog means writing a mapper
 * into these types, not editing the components.
 */

export type ProductVariant = {
  id: string;
  title: string; // e.g. size or color, "M" / "Navy"
  price: number; // in USD
};

// Future mapper (@wix/stores product → Product):
//   slug     ← product.slug
//   title    ← product.name
//   price    ← product.priceData?.price
//   image    ← product.media?.mainMedia?.image?.url  (run through media.getImageUrl)
//   category ← product.productType, or a collection we designate as the category
//   badge    ← not a Wix concept; ours to assign (ribbon is the closest analogue)
//   variants ← product.variants flattened; Wix models options × choices as a
//              matrix (size AND color), ours is a single axis, so the mapper
//              owns that flattening
export type Product = {
  slug: string;
  title: string;
  price: number; // base/display price in USD
  image: string; // path under /public or remote URL; "" = use placeholder
  category: string; // e.g. "headwear", "hoodies", "tees"
  collection?: string; // department or brand collection slug
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
