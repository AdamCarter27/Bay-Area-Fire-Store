"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ProductImage } from "@/components/product/ProductImage";
import { Button } from "@/components/ui/Button";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { recentWork } from "@/lib/data/recent-work";

// Runs before paint on the client so the deck is stacked in the same frame it
// hydrates rather than flashing the scattered layout first; falls back to
// useEffect during SSR.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/*
 * Where each card lands once it has been scattered — proofs tossed across the
 * table rather than dealt into a neat row. Hand-placed rather than generated:
 * six positions a person chose read as composed, where a random spread reads
 * as noise, and hardcoding them keeps the server and client render identical.
 *
 *   x  percentage of the card's own width from centre, so it scales with the card
 *   y  px above or below centre
 *   r  degrees of tilt
 *   s  scale, for the depth of things landing at different distances
 *
 * Two consumers share this table: the inline CSS transform that renders the
 * scatter with no JS at all, and the GSAP timeline that animates into it. Both
 * read the same numbers, so the two paths cannot disagree about where a card
 * belongs. Deliberately uneven — the gaps between cards vary, and no two
 * neighbours sit at the same height.
 */
type Placement = { x: number; y: number; r: number; s: number };

const SCATTER: Placement[] = [
  { x: -205, y: -52, r: -8, s: 1.0 },
  { x: -112, y: 54, r: 5, s: 0.95 },
  { x: -20, y: -68, r: -2, s: 1.04 },
  { x: 70, y: 38, r: 10, s: 0.97 },
  { x: 152, y: -44, r: -6, s: 1.01 },
  { x: 225, y: 60, r: 3, s: 0.94 },
];

/*
 * Falls back to a straight run for card counts the table doesn't cover, so
 * adding a seventh photo degrades to something sane instead of stacking two
 * cards on the same spot.
 */
function placement(i: number): Placement {
  return SCATTER[i] ?? { x: (i - 2.5) * 95, y: i % 2 ? 44 : -44, r: i % 2 ? 6 : -6, s: 1 };
}

function stackR(i: number): number {
  return ((i % 3) - 1) * 1.6;
}

/*
 * Custom work, shown the way it leaves the shop: a pile of proofs that
 * scatters across the table as you scroll past. The section pins for a little
 * over a viewport and the whole pile bursts apart at once, scrubbed to scroll
 * position — the same motion logic as the hero parallax and SplitHeadline, not
 * a new one.
 *
 * The scattered spread is also the resting state, written as a plain CSS
 * transform, so no-JS, hydration failure, reduced motion, and anything
 * narrower than lg all render a complete, finished section — nothing here is
 * hidden waiting for an animation to reveal it.
 */
/*
 * How many cards the scatter holds — one per hand-placed position in SCATTER.
 * The spread is geometry-bound, so the deck shows the leading slice and the
 * mobile strip, which scrolls, carries the rest.
 */
const DECK_COUNT = 6;

export function CustomWorkDeck() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const deck = recentWork.slice(0, DECK_COUNT);

  useIsoLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    if (!section || !stage) return;

    gsap.registerPlugin(ScrollTrigger);

    // matchMedia owns both gates: the fan needs desktop width to have anywhere
    // to deal into, and reduced motion opts out entirely. Crossing either
    // boundary reverts this context on its own — no manual listener, no stale
    // pin left behind at a narrower width.
    const mm = gsap.matchMedia();

    mm.add(
      {
        isWide: "(min-width: 1024px)",
        isCalm: "(prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { isWide, isCalm } = context.conditions as {
          isWide: boolean;
          isCalm: boolean;
        };
        if (!isWide || isCalm) return;

        const cards = gsap.utils.toArray<HTMLElement>("[data-deck-card]", stage);
        if (cards.length === 0) return;

        const n = cards.length;

        /*
         * GSAP owns the transform outright while it is driving, rather than
         * layering onto the inline CSS fan. It has to: CSSPlugin folds the
         * independent `translate` / `rotate` properties into its own matrix and
         * writes them back as `none`, so anything built on those two composing
         * runs inverted. xPercent/yPercent restore the -50% centering the
         * inline transform was doing, and the tween carries absolute start and
         * end values.
         */
        gsap.set(cards, {
          xPercent: -50,
          yPercent: -50,
          // First photo on top of the pile, and it stays the top card as the
          // others deal out from under it.
          zIndex: (i) => n - i,
        });

        /*
         * A timeline rather than a bare tween so the burst can finish before
         * the pin does. The throw occupies the first 70% of the pinned scroll
         * and the last 30% is dead air, which gives the finished scatter a beat
         * to sit still before the section scrolls away. Without the hold the
         * cards land on the exact frame the pin releases, and the composition
         * is gone before it registers.
         */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            // Short runway on purpose: the burst should be over well before
            // the visitor wonders why the page stopped moving. Much past
            // ~80% and a pinned section starts feeling like a hijacked scroll.
            end: "+=80%",
            pin: true,
            anticipatePin: 1,
            // Low scrub = the cards track the wheel almost exactly. Higher
            // values add catch-up lag, which reads as sluggish on a motion
            // this short.
            scrub: 0.30,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          cards,
          {
            // The pile: every card at dead center, tilted just enough to read
            // as a stack of separate prints.
            x: 0,
            y: 0,
            rotation: (i: number) => stackR(i),
            scale: (i: number) => 1 - i * 0.012,
          },
          {
            // Scattered. Function values are re-read on ScrollTrigger.refresh(),
            // so a resize re-measures instead of animating to a stale width.
            x: (i: number, el: HTMLElement) =>
              (placement(i).x / 100) * el.offsetWidth,
            y: (i: number) => placement(i).y,
            rotation: (i: number) => placement(i).r,
            scale: (i: number) => placement(i).s,
            // Slight ease-out rather than linear: the cards leave the pile
            // fast and settle, which reads as a throw instead of a drag.
            ease: "power2.out",
            // No stagger: the whole pile bursts apart in one motion. Every
            // card covers its own distance over the same scroll, so the ones
            // thrown furthest simply travel faster.
            duration: 0.7,
          }
        ).to({}, { duration: 0.3 });
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[88svh] flex-col justify-center border-y border-line bg-surface py-16 sm:py-20"
    >
      {/* Centred over the deck: the fan is the widest thing in the section, and
          a left-aligned column beside it leaves half the band empty. */}
      <div className="mx-auto w-full max-w-7xl px-5 text-center sm:px-8">
        <SplitHeadline
          mode="play"
          className="font-display text-[clamp(1.9rem,4vw,2.8rem)] font-semibold leading-[1.05] tracking-tight text-ink"
        >
          Got a Custom Job?
        </SplitHeadline>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-ink-soft">
          Embroidery, screen print, heat press, patches — done in-house for
          departments, teams, and academies across the Bay.
        </p>
        <div className="mt-8">
          <Button href="/custom-order" variant="primary" size="lg">
            Send us a message
          </Button>
        </div>
      </div>

      {/* Desktop: the deck itself. Cards rest scattered in CSS; when the
          timeline is live it starts them stacked and throws them back out. */}
      <div
        ref={stageRef}
        className="relative mt-10 hidden h-[clamp(340px,32vw,480px)] w-full lg:block"
      >
        {deck.map((photo, i) => (
          <figure
            key={i}
            data-deck-card
            className="absolute left-1/2 top-1/2 w-[clamp(170px,16vw,240px)] will-change-transform"
            style={{
              // The scatter, drawn with no JavaScript involved. This is what
              // renders if the bundle never arrives, if hydration fails, or if
              // the visitor asked for reduced motion — a finished section, not
              // a pile waiting to be animated. GSAP replaces this transform
              // wholesale once it takes over.
              transform: `translate(calc(-50% + ${placement(i).x}%), calc(-50% + ${placement(i).y}px)) rotate(${placement(i).r}deg) scale(${placement(i).s})`,
            }}
          >
            <ProductImage
              src={photo.src}
              alt={photo.alt}
              label={photo.label}
              sizes="18vw"
              className="aspect-square w-full rounded-lg border border-line bg-paper shadow-[0_10px_30px_-12px_rgba(0,0,0,0.28)]"
            />
          </figure>
        ))}
      </div>

      {/* Below lg there is nowhere to deal a fan into, so the same photos ride
          an edge-to-edge swipe strip — no pin, no JS required. */}
      <div
        tabIndex={0}
        role="region"
        aria-label="Custom work photos"
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal sm:px-8 lg:hidden"
      >
        {recentWork.map((photo, i) => (
          <figure
            key={i}
            className="w-[62%] shrink-0 snap-start sm:w-[38%]"
          >
            <ProductImage
              src={photo.src}
              alt={photo.alt}
              label={photo.label}
              sizes="(min-width: 640px) 38vw, 62vw"
              className="aspect-square w-full rounded-lg border border-line bg-paper"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
