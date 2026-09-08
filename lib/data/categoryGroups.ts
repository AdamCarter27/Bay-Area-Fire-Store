export type CategoryGroup = {
  slug: string;
  label: string;
  categories: string[];
};

export const categoryGroups: CategoryGroup[] = [
  { slug: "new-arrivals", label: "New Arrivals", categories: ["new-arrivals"] },
  { slug: "hats-beanies", label: "Hats & Beanies", categories: ["hats", "beanies"] },
  { slug: "jackets-hoodies", label: "Jackets & Hoodies", categories: ["jackets", "hoodies"] },
  { slug: "tees-tanks", label: "T-Shirts & Tanks", categories: ["tees", "tank-tops", "long-sleeves"] },
  { slug: "sweats", label: "Sweatshirts & Sweatpants", categories: ["sweatshirts", "sweatpants"] },
  { slug: "youth", label: "Youth", categories: ["youth"] },
  { slug: "custom", label: "Custom Apparel & Headwear", categories: ["custom-apparel", "custom-headwear"] },
  {
    slug: "pre-owned-leather-helmets",
    label: "Pre-Owned Leather Helmets",
    categories: ["leather-helmets"],
  },
  {
    slug: "accessories",
    label: "Accessories",
    categories: ["accessories", "stickers", "challenge-coins", "custom-fire-flags"],
  },
];