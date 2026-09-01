import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getProducts } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

/*
 * Prerender every product at build time.
 *
 * Product pages are the most-visited pages on the store and were previously
 * server-rendered on every request. On Cloudflare Workers the free plan allows
 * 10ms of CPU per request and server-side rendering is exactly the workload
 * that approaches it, so moving the catalog's biggest slice of traffic onto
 * prerendered HTML is the cheapest way to stay inside it.
 *
 * The build calls the catalog once; the module-scope cache in
 * lib/data/products.ts then serves all 259 renders from memory, so this costs
 * one Wix read rather than 259.
 */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

/*
 * Prices and stock change on the owner's schedule, so the prerendered HTML has
 * to refresh: without this a sold-out product would keep offering an Add to
 * Cart button until the next deploy. Matches CATALOG_TTL_SECONDS.
 */
export const revalidate = 300;

/*
 * Products added to Wix after the last build are not in generateStaticParams.
 * `true` (the default, stated here because it matters) renders them on demand
 * instead of 404ing, so the owner adding a product does not require a deploy.
 */
export const dynamicParams = true;

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/*
 * Per-product titles, descriptions and share images. Without this every one of
 * the ~256 products shares the site's generic title and has no preview image,
 * which is the single biggest SEO gap on a store.
 *
 * The catalog read here is the same cached call the page itself makes, so this
 * costs no extra network trip.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: true } };
  }

  // Prefer the owner's own copy; fall back to something factual rather than
  // leaving the description empty, since plenty of his products have none.
  const description =
    product.description?.trim() ||
    `${product.title} — ${priceFmt.format(product.price)} from the Bay Area Fire Store. Firefighter-owned, shipped from the Bay Area.`;

  return {
    title: product.title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.title,
      description,
      url: `/product/${product.slug}`,
      images: product.image ? [{ url: product.image, alt: product.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: product.image ? [product.image] : undefined,
    },
    // A sold-out product still deserves to be found — people search for it and
    // he restocks the same designs — so nothing is deindexed on stock alone.
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
