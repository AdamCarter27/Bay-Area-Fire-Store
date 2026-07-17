// Mock product data. Structured to mirror a future Shopify data source so the
// UI can swap to a real backend without shape changes.
//
// product photography. Cards render a branded placeholder frame until a path
// (e.g. "/products/sffd-tee.jpg" under /public) is filled in here.

export type ProductVariant = {
  id: string;
  title: string; // e.g. size or color, "M" / "Navy"
  price: number; // in USD
};

export type Product = {
  slug: string;
  title: string;
  price: number; // base/
  image: string; // path under /public or remote URL; "" = use placeholder
  category: string; // e.g. "headwear", "hoodies", "tees"
  collection?: string; // department or brand collection slug
  badge?: string; // small merchandising flag, e.g. "New", "Best seller"
  variants: ProductVariant[];
};

const sizes = (base: number): ProductVariant[] =>
  ["S", "M", "L", "XL", "2XL"].map((s, i) => ({
    id: s.toLowerCase(),
    title: s,
    price: base + (i === 4 ? 3 : 0),
  }));

const oneSize = (price: number): ProductVariant[] => [
  { id: "os", title: "One size", price },
];

export const products: Product[] = [
  {
    slug: "vallejo-fighting-3-hoodie",
    title: 'Vallejo Firefighters "Fighting 3" Navy Hooded Sweatshirt',
    price: 60,
    image: "",
    category: "hoodies",
    collection: "bay-area",
    badge: "Best seller",
    variants: sizes(60),
  },
  {
    slug: "vallejo-fighting-3-tee",
    title: 'Vallejo Firefighters "Fighting 3" Navy T-Shirt',
    price: 35,
    image: "",
    category: "tees",
    collection: "bay-area",
    variants: sizes(35),
  },
  {
    slug: "sffd-arson-task-force-tee",
    title: "SFFD Arson Task Force T-Shirt",
    price: 20,
    image: "",
    category: "tees",
    collection: "sffd",
    badge: "Best seller",
    variants: sizes(20),
  },
  {
    slug: "sf-seals-2-snapback",
    title: "SF Seals #2 Black/Orange SnapBack Hat",
    price: 29.99,
    image: "",
    category: "hats",
    collection: "bay-area",
    variants: oneSize(29.99),
  },
  {
    slug: "front-seat-academy-hoodie",
    title: "Front Seat Academy Officers Orchestra Hooded Sweatshirt",
    price: 49.99,
    image: "",
    category: "hoodies",
    collection: "bay-area",
    badge: "New",
    variants: sizes(49.99),
  },
  {
    slug: "front-seat-academy-tee",
    title: "Front Seat Academy Officers Orchestra T-Shirt",
    price: 29.99,
    image: "",
    category: "tees",
    collection: "bay-area",
    variants: sizes(29.99),
  },
  {
    slug: "sf-behavioral-health-richardson-snapback",
    title: "SF Behavioral Health Richardson SnapBack Hat",
    price: 24.99,
    image: "",
    category: "hats",
    collection: "bay-area",
    variants: oneSize(24.99),
  },
  {
    slug: "sf-behavioral-health-dad-hat",
    title: 'SF Behavioral Health "Dad Hat"',
    price: 24.99,
    image: "",
    category: "hats",
    collection: "bay-area",
    badge: "New",
    variants: oneSize(24.99),
  },
];

export type Collection = {
  slug: string;
  title: string;
  kind: "department" | "brand";
  blurb: string;
  image: string; // owner-supplied; "" = placeholder
};

export const collections: Collection[] = [
  {
    slug: "sffd",
    title: "SFFD",
    kind: "department",
    blurb: "San Francisco Fire Department",
    image: "",
  },
  {
    slug: "richmond-fire",
    title: "Richmond Fire",
    kind: "department",
    blurb: "Richmond Fire Department",
    image: "",
  },
  {
    slug: "colma-fire",
    title: "Colma Fire",
    kind: "department",
    blurb: "Colma Fire District",
    image: "",
  },
  {
    slug: "front-seat-academy",
    title: "Front Seat Academy",
    kind: "brand",
    blurb: "Training academy apparel",
    image: "",
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeatured(count = 8): Product[] {
  return products.slice(0, count);
}
