"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const SERVICES = ["Embroidery", "Screen printing", "Heat press"];

const ITEM_HEIGHT = 64; // px — must match the h-16 rows below
const VISIBLE_ROWS = 5;
const CENTER_ROW = Math.floor(VISIBLE_ROWS / 2);
const HOLD = 0.8; // seconds each service stays centered
const MOVE = 0.5; // seconds it takes to step to the next one

// The list is four copies deep and the loop plays across the middle two, so
// the window always has real rows to ghost above and below the centered
// word — no blank gaps at either end of a cycle.
const REPEATS = 4;
const START = SERVICES.length; // first item of the second copy

// translateY that puts item `k` in the middle row of the window.
const yFor = (k: number) => (CENTER_ROW - k) * ITEM_HEIGHT;

// Fades rows out by distance from the center band, so the focused
// service reads full-ink and its neighbors read ghosted.
const MASK =
  "linear-gradient(to bottom, transparent 4%, rgba(0,0,0,0.16) 32%, black 46%, black 54%, rgba(0,0,0,0.16) 68%, transparent 96%)";

export default function VerticalTextCarousel() {
  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ repeat: -1, delay: HOLD });

      SERVICES.forEach((_, i) => {
        tl.to(listRef.current, {
          y: yFor(START + i + 1),
          duration: MOVE,
          ease: "power3.inOut",
        });
        tl.to({}, { duration: HOLD });
      });

      // One cycle lands exactly one copy further down, where every visible
      // row — centered and ghosted — repeats the starting arrangement, so
      // resetting the list is invisible.
      tl.set(listRef.current, { y: yFor(START) });
    });
  });

  return (
    <section className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-8">
      <p className="sr-only">
        We customize: embroidery, screen printing, and heat pressing
      </p>

      <h2
        aria-hidden
        className="whitespace-nowrap font-display text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.02em] text-ink"
      >
        We customize
      </h2>

      {/* hairline — spark — hairline, echoing the wordmark's red dot */}
      <div aria-hidden className="hidden items-center gap-3 sm:flex">
        <span className="h-px w-14 bg-line-strong" />
        <span className="h-1.5 w-1.5 rounded-full bg-signal" />
        <span className="h-px w-14 bg-line-strong" />
      </div>

      <div
        aria-hidden
        className="overflow-hidden"
        style={{
          height: ITEM_HEIGHT * VISIBLE_ROWS,
          maskImage: MASK,
          WebkitMaskImage: MASK,
        }}
      >
        <ul
          ref={listRef}
          // Inline so the resting position is correct before JS runs, and
          // stays correct when reduced motion keeps the loop from starting.
          style={{ transform: `translateY(${yFor(START)}px)` }}
        >
          {Array.from({ length: REPEATS })
            .flatMap(() => SERVICES)
            .map((service, i) => (
              <li
                key={i}
                className="flex h-16 items-center justify-center whitespace-nowrap font-display text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.02em] text-ink sm:justify-start"
              >
                {service}
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
