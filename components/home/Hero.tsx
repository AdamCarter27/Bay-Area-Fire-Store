"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Button } from "@/components/ui/Button";
import { backgroundVideo } from "@/lib/data/culture";

export function Hero() {
  const hasVideo = Boolean(backgroundVideo.src);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const content = contentRef.current;
    const video = videoRef.current;
    if (!root || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;

    if (video) {
      if (reduce) video.pause();
      else video.play().catch(() => {});
    }

    // Reduced motion: no parallax handoff — GSAP/ScrollTrigger never engages.
    if (reduce) return;

    gsap.registerPlugin(ScrollTrigger);
    const wrap = root.parentElement ?? root;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: () => `+=${window.innerHeight}`,
          invalidateOnRefresh: true,
          scrub: 0.4, 
          onUpdate: (self) => {
            if (!video) return;
            if (self.progress >= 0.99 && !video.paused) video.pause();
            else if (self.progress < 0.99 && video.paused) video.play().catch(() => {});
          },
        },
      });

      // Video layer recedes across the full scroll range.
      tl.to(
        stage,
        {
          scale: 0.94,
          yPercent: 8,
          opacity: 0.5,
          ...(small ? {} : { filter: "blur(6px)" }),
          ease: "none",
          duration: 1,
        },
        0,
      );

      if (content) {
        tl.to(
          content,
          { opacity: 0, y: -110, ease: "none", duration: 1 / 1.6 },
          0,
        );
      }
    }, root);

    return () => ctx.revert();
  }, [hasVideo]);

  return (
    <div
      ref={rootRef}
      className="sticky top-0 z-0 flex h-[92svh] min-h-[560px] items-end overflow-hidden bg-ink"
    >
      {/* Video layer (recedes on scroll) */}
      <div ref={stageRef} className="absolute inset-0 will-change-transform">
        {hasVideo ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={backgroundVideo.src}
            poster={backgroundVideo.poster || undefined}
            muted
            loop
            playsInline
            autoPlay
            // metadata, not auto: the poster paints immediately and autoplay
            // still pulls the file, but the browser schedules the download
            // instead of racing it against every above-fold asset. The clip is
            // re-encoded at CRF 33 (~1.1MB, down from 4.7MB) — it sits behind
            // content at cover scale, so the lost detail is invisible.
            preload="metadata"
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0" aria-hidden>
            <div
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, var(--paper) 0 1px, transparent 1px 14px)",
              }}
            />
          </div>
        )}
      </div>

      {/* Scrim for legibility (heaviest at the bottom, behind the text) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-ink/45"
      />

      {/* Overlaid content, bottom-anchored (fades out with scroll) */}
      <div
        ref={contentRef}
        className="relative mx-auto w-full max-w-7xl px-5 pb-16 will-change-transform sm:px-8 sm:pb-20 lg:pb-24"
      >
        <p
          className="fs-hero-in flex items-center gap-2.5 text-sm font-medium text-paper/80"
          style={{ animationDelay: "60ms" }}
        >
        </p>

        <h1
          className="fs-hero-in mt-5 max-w-4xl font-display text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.03em] text-paper"
          style={{ animationDelay: "150ms" }}
        >
          Your Local Source for Bay Area{" "}
          <span className="text-signal">Fire</span> Gear
        </h1>

        <div
          className="fs-hero-in mt-9 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "460ms" }}
        >
          <Button href="/shop" variant="primary" size="lg">
            Shop
          </Button>
          <Button
            href="/custom-order"
            variant="secondary"
            size="lg"
            className="border-paper/40 text-paper hover:border-paper hover:bg-paper/10"
          >
            Start a custom order
          </Button>
        </div>
      </div>
    </div>
  );
}
