import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

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
