"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
} from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Runs before paint on the client so the words are hidden and animating in the
// same frame they hydrate; falls back to useEffect during SSR.
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
  Section headline that reveals word-by-word: each word is masked (clipped)
  and rises/fades in. "scrub" (default) ties the reveal directly to scroll
  position — right for sections with scroll runway. "play" runs it once,
  time-based, when the headline enters view (immediately if already visible
  on load) — for sections near the top of short pages.
 */
export function SplitHeadline({
  as = "h2",
  children,
  className = "",
  mode = "scrub",
}: {
  as?: ElementType;
  children: string;
  className?: string;
  mode?: "scrub" | "play";
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as ElementType;

  useIsoLayoutEffect(() => {
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
        ...(mode === "scrub"
          ? {
              ease: "none",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                end: "top 50%",
                scrub: 0.4,
              },
            }
          : {
              duration: 1.1,
              ease: "expo.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true,
              },
            }),
      });

      return () => split.revert();
    }, el);

    return () => ctx.revert();
  }, [mode]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
