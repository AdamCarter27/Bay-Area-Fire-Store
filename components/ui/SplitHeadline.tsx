"use client";

import { useEffect, useRef, type ElementType } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
  Section headline that reveals word-by-word as it scrolls into view: each
  word is masked (clipped) and rises/fades in, scrubbed directly to scroll
  position 
 */
export function SplitHeadline({
  as = "h2",
  children,
  className = "",
}: {
  as?: ElementType;
  children: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    gsap.registerPlugin(SplitText, ScrollTrigger);

    const ctx = gsap.context(() => {
      const split = new SplitText(el, { type: "words", mask: "words" });

      gsap.from(split.words, {
        yPercent: 110,
        opacity: 0,
        duration: 0.6,
        stagger: 0.045,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top 90%",
          end: "top 50%",
          scrub: 0.4,
        },
      });

      return () => split.revert();
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
