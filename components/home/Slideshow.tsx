"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import { slideshowPhotos } from "@/lib/data/slideshow-photos";

export function Slideshow() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let frameId: number;
    const speed = 1.0; // pixels per frame — raise for faster, lower for slower

    const tick = () => {
      if (!isPaused.current) {
        el.scrollLeft += speed;

        // Once we've scrolled past the first copy of the list, snap back to
        // the start — since the list is duplicated, this jump is invisible.
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft = 0;
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (slideshowPhotos.length === 0) return null;

  const slides = [...slideshowPhotos, ...slideshowPhotos];

  return (
    <section className="mt-6 overflow-hidden bg-ink py-8 sm:mt-10 sm:py-10">
      <div
        ref={scrollRef}
        onMouseEnter={() => (isPaused.current = true)}
        onMouseLeave={() => (isPaused.current = false)}
        className="flex gap-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((photo, i) => (
          <div
            key={i}
            className="relative h-56 w-80 shrink-0 overflow-hidden rounded-xl border border-line-strong sm:h-72 sm:w-[26rem]"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="416px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}