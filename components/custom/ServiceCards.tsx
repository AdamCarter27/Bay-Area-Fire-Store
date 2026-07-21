"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { services, type Service } from "@/lib/data/services";

// Runs before paint on the client so the band is inset and ready to expand in
// the same frame it hydrates; falls back to useEffect during SSR.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function ServiceCards() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // Expanding ink band: the black background starts slightly inset with
  // rounded corners and scrubs to full-bleed as the section scrolls into
  // view. Only the background layer animates — the content column never
  // transforms, so nothing distorts. The resting state (SSR, no-JS, reduced
  // motion, scrolled past) is a square full-bleed band.
  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(bg, {
        scaleX: 0.94,
        scaleY: 0.96,
        borderRadius: 24,
        transformOrigin: "50% 50%",
      });
      gsap.to(bg, {
        scaleX: 1,
        scaleY: 1,
        borderRadius: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 30%",
          scrub: 0.4,
          invalidateOnRefresh: true,
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative isolate py-16 sm:py-24">
      <div
        ref={bgRef}
        aria-hidden
        className="absolute inset-0 -z-10 bg-ink will-change-transform"
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <SplitHeadline
          mode="play"
          className="text-center font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-paper"
        >
          Available Services
        </SplitHeadline>
        <p className="mx-auto mt-4 max-w-2xl text-center text-paper/70">

          Welcome to the Bay Area Fire Store, where we take pride in our exceptional craftsmanship. With our services including embroidery, screen printing, and heat pressing, we are fully equipped to meet your custom needs. Allow us to assist you in your vision with our high-quality products.

        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {services.map((service, i) => (
            <Reveal key={service.name} delay={(i % 3) * 70} className="min-w-0">
              <ServiceCard service={service} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
 * Flip card. On hover-capable devices, hover or keyboard focus rotates the
 * card 180° to an inverted paper face carrying the item list. Tailwind v4
 * compiles hover: variants inside (hover: hover), so on touch devices the
 * can-hover: classes vanish: the card never rotates and the front's gradient
 * overlay list is simply visible. The front overlay hides via opacity (not
 * display) on hover devices so the list stays in the accessibility tree;
 * the back face duplicates it visually and is aria-hidden.
 */
function ServiceCard({ service }: { service: Service }) {
  return (
    <div
      tabIndex={0}
      role="group"
      aria-label={`${service.name} services`}
      className="group flex flex-col"
    >
      <div className="relative perspective-distant">
        <div className="relative transform-3d transition-transform duration-500 ease-out motion-reduce:transition-none can-hover:group-hover:rotate-y-180 can-hover:group-focus-visible:rotate-y-180">
          {/* Front: photo (in-flow, sets the flipper's height) */}
          <div className="backface-hidden relative overflow-hidden rounded-lg border border-paper/15 transition-colors group-hover:border-paper/40 group-focus-visible:border-paper/40">
            <ProductImage
              src={service.image}
              alt={`${service.name} equipment`}
              label={service.name}
              sizes="(min-width: 640px) 30vw, 90vw"
              className="aspect-square w-full"
            />

            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-gradient-to-t from-ink/90 via-ink/70 to-ink/0 px-5 pb-5 pt-14 can-hover:opacity-0">
              <span className="text-xs font-medium uppercase tracking-wider text-paper/70">
                Covers
              </span>
              <ul className="flex flex-col gap-1 text-sm text-paper">
                {service.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-1 w-1 shrink-0 rounded-full bg-signal"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Back: inverted paper face */}
          <div
            aria-hidden
            className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col justify-center gap-2 overflow-hidden rounded-lg bg-paper px-5 lg:gap-2.5 lg:px-6"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-ash">
              Covers
            </span>
            <ul className="flex flex-col gap-1 text-sm text-ink lg:gap-1.5">
              {service.items.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-1 w-1 shrink-0 rounded-full bg-signal"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <h3 className="mt-3.5 font-display text-[0.98rem] font-medium leading-snug text-paper transition-colors group-hover:text-signal group-focus-visible:text-signal">
        {service.name}
      </h3>
    </div>
  );
}
