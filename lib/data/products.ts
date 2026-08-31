/*
 * The catalog's public surface. Every page and component reads products through
 * these four functions and never touches a data source directly, so switching
 * from the mock array to Wix (or Shopify, or anything else) is a change to this
 * file alone.
 *
 * They now read the live Wix Stores catalog through lib/wix/get-prod.ts. A
 * catalog read is three network round-trips (Wix caps a page at 100 items), so
 * it is cached two ways: the module-scope cache below holds the mapped result
 * across requests for CATALOG_TTL_SECONDS, and React cache() dedupes it within
 * a single render, where the shop page, header, and footer would otherwise
 * each ask for it.
 *
 * A module-scope cache rather than unstable_cache because we deploy to the
 * Cloudflare Workers runtime, where Next's data cache needs a storage binding
 * (R2/KV) to persist to. Wix-managed hosting gives us the runtime without a
 * Cloudflare account, so that binding does not exist and unstable_cache
 * silently degraded to no caching at all — a full catalog re-walk per page
 * view. A module-scope value needs no binding and survives between requests,
 * because the runtime reuses an isolate across them.
 *
 * The tradeoff: this cache is per-isolate rather than shared, so a cold isolate
 * refetches. Nothing is lost relative to the unstable_cache version — the tag
 * it declared was never passed to revalidateTag anywhere, so its only real
 * behavior was the same time-based expiry reproduced here.
 */

import { cache } from "react";
import { getWixProducts } from "@/lib/wix/get-prod";
import { brands, brandGroups } from "./brands";
import { mockProducts } from "./mock-products";
import type { Collection, Product } from "./types";

// Inventory and prices change on the owner's schedule, not ours; five minutes
// keeps the store current without re-walking 256 products on every visit.
const CATALOG_TTL_SECONDS = 300;

let cached: { products: Product[]; expires: number } | null = null;
// Holds the request that is currently refreshing the cache. Without it, a burst
// of traffic arriving on an expired cache would each start their own full
// catalog walk against Wix.
let inflight: Promise<Product[]> | null = null;

function fetchCatalog(): Promise<Product[]> {
  if (cached && Date.now() < cached.expires) {
    return Promise.resolve(cached.products);
  }
  if (inflight) return inflight;

  inflight = getWixProducts()
    .then((products) => {
      cached = {
        products,
        expires: Date.now() + CATALOG_TTL_SECONDS * 1000,
      };
      return products;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}

/*
 * The mock catalog stays as a fallback rather than dead weight: if Wix is
 * unreachable the store renders 15 products instead of a 500. Stale real
 * products beat fresh mock ones, though, so a failed *refresh* keeps serving
 * the last good catalog and only a cold failure falls through to the mocks.
 */
const getCatalog = cache(async (): Promise<Product[]> => {
  try {
    const products = await fetchCatalog();
    return products.length > 0 ? products : mockProducts;
  } catch (error) {
    if (cached && cached.products.length > 0) {
      console.error("[wix] catalog refresh failed — serving stale catalog", error);
      return cached.products;
    }
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
