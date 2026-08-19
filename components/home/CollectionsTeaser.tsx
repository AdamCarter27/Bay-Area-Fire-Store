import Link from "next/link";
import { getCollections } from "@/lib/data/products";
import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/ui/SplitHeadline";

export async function CollectionsTeaser() {
  const collections = await getCollections();

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SplitHeadline className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink">
            Departments &amp; brands
          </SplitHeadline>
          <p className="mt-2 max-w-md text-ash">
            Shop your department or the brands you trust.
          </p>
        </div>
        <Link
          href="/brands"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-signal"
        >
          Browse all
          <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Mobile: edge-to-edge swipe carousel; sm and up: the original grid. */}
      <div className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
        {collections.map((c, i) => (
          <Reveal
            key={c.slug}
            delay={(i % 4) * 70}
            className="w-[62%] min-w-0 shrink-0 snap-start sm:w-auto"
          >
            <Link href={`/shop?brand=${c.slug}`} className="group block">
              <ProductImage
                src={c.image}
                alt={c.title}
                label={c.kind}
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="aspect-square w-full rounded-lg border border-line transition-colors group-hover:border-line-strong"
              />
              <h3 className="mt-3 font-display text-lg font-medium text-ink transition-colors group-hover:text-signal">
                {c.title}
              </h3>
              <p className="text-sm text-ash">{c.blurb}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
