"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
export function Reveal({
  children,
  as = "div",
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  as?: ElementType;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    el.dataset.reveal = "armed";
    el.style.transitionDelay = `${delay}ms`;

    const reveal = () => {
      el.dataset.reveal = "shown";
    };

    // No observer support → don't hide content.
    if (!("IntersectionObserver" in window)) {
      reveal();
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = "shown";
            obs.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    // Anything already in view on mount reveals on the next frame.
    const raf = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.95) reveal();
    });

    // Backstop: content must never stay hidden if the observer never fires
    // (headless renders, background tabs, delayed delivery).
    const backstop = window.setTimeout(reveal, 1200);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(backstop);
    };
  }, [delay]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
