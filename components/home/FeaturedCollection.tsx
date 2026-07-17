import Link from "next/link";
import { getFeatured } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";

export function FeaturedCollection() {
  const products = getFeatured(8);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink">
            New drops
          </h2>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-signal"
        >
          View all products
          <span aria-hidden>→</span>
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        {products.map((product, i) => (
          <Reveal key={product.slug} delay={(i % 4) * 70} className="min-w-0">
            <ProductCard product={product} priority={i < 4} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
