/*
 * The catalog's public surface. Every page and component reads products through
 * these four functions and never touches a data source directly, so switching
 * from the mock array to Wix (or Shopify, or anything else) is a change to this
 * file alone.
 *
 * They're async despite reading a local array in memory: a real catalog is a
 * network call, and having the signatures already return promises means the
 * swap doesn't ripple out into every caller as a second refactor.
 */

import { mockCollections, mockProducts } from "./mock-products";
import type { Collection, Product } from "./types";

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return mockProducts.find((p) => p.slug === slug);
}

export async function getFeatured(count = 8): Promise<Product[]> {
  return mockProducts.slice(0, count);
}

export async function getCollections(): Promise<Collection[]> {
  return mockCollections;
}
