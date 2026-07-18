import Link from "next/link";
import { collections } from "@/lib/data/products";
import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/ui/Reveal";

export function CollectionsTeaser() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink">
            Departments &amp; brands
          </h2>
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

      <div className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {collections.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 4) * 70} className="min-w-0">
            <Link href="/brands" className="group block">
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
