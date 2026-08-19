/*
 * The catalog's public surface. Every page and component reads products through
 * these four functions and never touches a data source directly, so switching
 * from the mock array to Wix (or Shopify, or anything else) is a change to this
 * file alone.
 *
 * They now read the live Wix Stores catalog through lib/wix/get-prod.ts. A
 * catalog read is three network round-trips (Wix caps a page at 100 items), so
 * it is cached two ways: unstable_cache holds the mapped result across requests
 * for CATALOG_TTL_SECONDS, and React cache() dedupes it within a single render,
 * where the shop page, header, and footer would otherwise each ask for it.
 *
 * unstable_cache rather than the `use cache` directive on purpose: `use cache`
 * requires cacheComponents: true in next.config.ts, a project-wide rendering
 * change that would force /shop (which reads searchParams) into a Suspense
 * refactor. That is not worth it for one data read.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getWixProducts } from "@/lib/wix/get-prod";
import { brands, brandGroups } from "./brands";
import { mockProducts } from "./mock-products";
import type { Collection, Product } from "./types";

// Inventory and prices change on the owner's schedule, not ours; five minutes
// keeps the store current without re-walking 256 products on every visit.
const CATALOG_TTL_SECONDS = 300;

const fetchCatalog = unstable_cache(getWixProducts, ["wix-catalog"], {
  revalidate: CATALOG_TTL_SECONDS,
  tags: ["catalog"],
});

/*
 * The mock catalog stays as a fallback rather than dead weight: if Wix is
 * unreachable mid-demo, the store renders 15 products instead of a 500.
 */
const getCatalog = cache(async (): Promise<Product[]> => {
  try {
    const products = await fetchCatalog();
    return products.length > 0 ? products : mockProducts;
  } catch (error) {
    console.error("[wix] catalog read failed — serving mock products", error);
    return mockProducts;
  }
});

export async function getProducts(): Promise<Product[]> {
  return getCatalog();
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const products = await getCatalog();
  return products.find((p) => p.slug === slug);
}

/*
 * The home page's featured row is merchandising, not inventory: lead with
 * products a visitor can actually buy and that have a photo, and only fall back
 * to the rest if the catalog is thin.
 */
export async function getFeatured(count = 8): Promise<Product[]> {
  const products = await getCatalog();
  const shoppable = products.filter((p) => p.inStock && p.image);
  return (shoppable.length >= count ? shoppable : products).slice(0, count);
}

// How many brand tiles the home teaser shows. More than this and the section
// stops being a teaser and starts being the /brands page.
const TEASER_COLLECTIONS = 8;

const DEPARTMENT_GROUPS = new Set(["fire-departments", "police-departments"]);

/*
 * Departments and brands, derived from the live catalog rather than a hand-kept
 * list: a brand appears only if it actually has products, and its tile borrows
 * the first in-stock product's photo, so the teaser shows real gear instead of
 * eight empty placeholder frames. Ordered by how much product backs each one.
 */
export async function getCollections(): Promise<Collection[]> {
  const products = await getCatalog();

  const kindBySlug = new Map<string, Collection["kind"]>();
  for (const group of brandGroups) {
    const kind = DEPARTMENT_GROUPS.has(group.slug) ? "department" : "brand";
    for (const slug of group.brands) kindBySlug.set(slug, kind);
  }

  return brands
    .map((brand) => {
      const owned = products.filter((p) => p.collections.includes(brand.slug));
      const hero = owned.find((p) => p.inStock && p.image) ?? owned[0];

      return {
        slug: brand.slug,
        title: brand.label,
        kind: kindBySlug.get(brand.slug) ?? "brand",
        blurb: `${owned.length} ${owned.length === 1 ? "item" : "items"}`,
        image: hero?.image ?? "",
        count: owned.length,
      };
    })
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, TEASER_COLLECTIONS)
    .map(({ count: _count, ...collection }) => collection);
}
