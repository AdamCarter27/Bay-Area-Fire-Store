import { notFound } from "next/navigation";
import { getProduct } from "@/lib/data/products";
import { ProductDetail } from "@/components/product/ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}