/*
 * Stand-in catalog. Only lib/data/products.ts should import this — pages and
 * components go through the accessors there, so pointing those accessors at a
 * real catalog later doesn't touch anything that renders.
 */

import type { Collection, Product, ProductVariant } from "./types";

const sizes = (base: number): ProductVariant[] =>
  ["S", "M", "L", "XL", "2XL"].map((s, i) => ({
    id: s.toLowerCase(),
    title: s,
    price: base + (i === 4 ? 3 : 0),
  }));

const oneSize = (price: number): ProductVariant[] => [
  { id: "os", title: "One size", price },
];

// Hats use their own sizing system — adjustable (One Size, S/M, L/XL) rather
// than the apparel S–2XL scale.
const hatSizes = (price: number): ProductVariant[] => [
  { id: "one-size", title: "One Size", price },
  { id: "sm", title: "S/M", price },
  { id: "lxl", title: "L/XL", price },
];

export const mockProducts: Product[] = [
  {
    wixId: "",
    slug: "vallejo-fighting-3-hoodie",
    title: 'Vallejo Firefighters "Fighting 3" Navy Hooded Sweatshirt',
    price: 60,
    image: "",
    categories: ["hoodies"],
    collections: ["bay-area"],
    badge: "Best seller",
    variants: sizes(60),
  },
  {
    wixId: "",
    slug: "vallejo-fighting-3-tee",
    title: 'Vallejo Firefighters "Fighting 3" Navy T-Shirt',
    price: 35,
    image: "",
    categories: ["tees"],
    collections: ["bay-area"],
    variants: sizes(35),
  },
  {
    wixId: "",
    slug: "sffd-arson-task-force-tee",
    title: "SFFD Arson Task Force T-Shirt",
    price: 20,
    image: "",
    categories: ["tees"],
    collections: ["sffd"],
    badge: "Best seller",
    variants: sizes(20),
  },
  {
    wixId: "",
    slug: "sf-seals-2-snapback",
    title: "SF Seals #2 Black/Orange SnapBack Hat",
    price: 29.99,
    image: "",
    categories: ["hats"],
    collections: ["bay-area"],
    variants: hatSizes(29.99),
  },
  {
    wixId: "",
    slug: "front-seat-academy-hoodie",
    title: "Front Seat Academy Officers Orchestra Hooded Sweatshirt",
    price: 49.99,
    image: "",
    categories: ["hoodies"],
    collections: ["bay-area"],
    badge: "New",
    variants: sizes(49.99),
  },
  {
    wixId: "",
    slug: "front-seat-academy-tee",
    title: "Front Seat Academy Officers Orchestra T-Shirt",
    price: 29.99,
    image: "",
    categories: ["tees"],
    collections: ["bay-area"],
    variants: sizes(29.99),
  },
  {
    wixId: "",
    slug: "sf-behavioral-health-richardson-snapback",
    title: "SF Behavioral Health Richardson SnapBack Hat",
    price: 24.99,
    image: "",
    categories: ["hats"],
    collections: ["bay-area"],
    variants: hatSizes(24.99),
  },
  {
    wixId: "",
    slug: "sf-behavioral-health-dad-hat",
    title: 'SF Behavioral Health "Dad Hat"',
    price: 24.99,
    image: "",
    categories: ["hats"],
    collections: ["bay-area"],
    badge: "New",
    variants: hatSizes(24.99),
  },
];

export const mockCollections: Collection[] = [
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

// Kept for products that don't carry a size axis (patches, stickers, decals) —
// none in the mock set yet, but the helper belongs beside its siblings.
export { oneSize };
