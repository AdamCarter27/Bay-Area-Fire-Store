import Link from "next/link";
import { getFeatured } from "@/lib/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/ui/SplitHeadline";

export function FeaturedCollection() {
  const products = getFeatured(8);

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SplitHeadline className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink">
            New drops
          </SplitHeadline>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-signal"
        >
          View all products
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Mobile: edge-to-edge swipe carousel (with a peek of the next card).
          sm and up: the original grid. */}
      <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {products.map((product, i) => (
          <Reveal
            key={product.slug}
            delay={(i % 4) * 70}
            className="w-[62%] min-w-0 shrink-0 snap-start sm:w-auto"
          >
            <ProductCard product={product} priority={i < 4} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
