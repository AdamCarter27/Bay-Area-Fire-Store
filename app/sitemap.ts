import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data/products";
import { SITE_URL } from "@/lib/site-url";

/*
 * The XML sitemap Google reads at /sitemap.xml.
 *
 * Two rules decide what belongs here:
 *
 *  1. Only pages we want indexed. /cart, /checkout, /checkout/complete and
 *     /wix-test all set `robots: { index: false }` in their own metadata —
 *     listing them would ask Google to crawl pages we then tell it to drop.
 *  2. Only canonical URLs. Every filtered shop view (?brand=, ?group=, ?q=)
 *     canonicalises back to bare /shop, so the sitemap lists /shop once and
 *     lets the crawler reach the rest through the product links.
 *
 * `lastModified` is deliberately absent on the product entries: the Wix
 * catalog does not expose a per-product modified date, and stamping every
 * product with the build time is a lie crawlers learn to ignore.
 */

// Priorities are relative to each other, not absolute scores: the storefront
// and catalog lead, the service pages follow, boilerplate trails.
const staticRoutes: MetadataRoute.Sitemap = [
  { url: "/", changeFrequency: "weekly", priority: 1 },
  { url: "/shop", changeFrequency: "daily", priority: 0.9 },
  { url: "/brands", changeFrequency: "weekly", priority: 0.8 },
  { url: "/custom-order", changeFrequency: "monthly", priority: 0.8 },
  { url: "/custom-order/brands", changeFrequency: "monthly", priority: 0.6 },
  { url: "/custom-order/stickers", changeFrequency: "monthly", priority: 0.6 },
  { url: "/about", changeFrequency: "monthly", priority: 0.5 },
  { url: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { url: "/faq", changeFrequency: "monthly", priority: 0.4 },
  { url: "/shipping-returns", changeFrequency: "monthly", priority: 0.4 },
  { url: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Same cached catalog read the pages make, so generating the sitemap costs
  // no extra Wix round-trip. If Wix is down, getProducts() falls back to the
  // mock catalog and the sitemap still renders its static half.
  const products = await getProducts();

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${SITE_URL}/product/${product.slug}`,
    changeFrequency: "weekly",
    // In-stock products are the ones worth a crawl budget.
    priority: product.inStock ? 0.7 : 0.4,
    // Image sitemap entries — the catalog photos are the point of a merch
    // store. Wix serves them absolute; anything local we skip rather than
    // guess at a host.
    ...(product.image.startsWith("https://")
      ? { images: [product.image] }
      : {}),
  }));

  return [
    ...staticRoutes.map((route) => ({
      ...route,
      url: `${SITE_URL}${route.url === "/" ? "" : route.url}`,
    })),
    ...productRoutes,
  ];
}
