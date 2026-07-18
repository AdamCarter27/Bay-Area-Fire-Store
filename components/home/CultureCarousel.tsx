"use client";

import { useRef } from "react";
import { culturePhotos } from "@/lib/data/culture";
import { ProductImage } from "@/components/product/ProductImage";
import { SplitHeadline } from "@/components/ui/SplitHeadline";

export function CultureCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const amount = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SplitHeadline className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink">
            Pictures and whatnot
          </SplitHeadline>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous photos"
            onClick={() => scrollByCards(-1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
              <path
                d="M11 4l-5 5 5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next photos"
            onClick={() => scrollByCards(1)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line-strong text-ink transition-colors hover:border-ink"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
              <path
                d="M7 4l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Team and SF fire photos"
        className="no-scrollbar mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      >
        {culturePhotos.map((photo, i) => (
          <figure
            key={i}
            data-card
            className="w-[82%] shrink-0 snap-center sm:w-[47%] lg:w-[31.5%]"
          >
            <ProductImage
              src={photo.src}
              alt = "photo"
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 82vw"
              className="aspect-[4/3] w-full rounded-lg border border-line"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
