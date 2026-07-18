"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { backgroundVideo } from "@/lib/data/culture";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

export function Hero() {
  const hasVideo = Boolean(backgroundVideo.src);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const video = videoRef.current;
    if (!root || !stage) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 767px)").matches;

    if (video) {
      if (reduce) video.pause();
      else video.play().catch(() => {});
    }

    const wrap = root.parentElement ?? root;
    let raf = 0;
    const update = () => {
      raf = 0;
      const progress = clamp01(-wrap.getBoundingClientRect().top / window.innerHeight);
      if (!reduce) {
        stage.style.transform = `scale(${1 - progress * 0.06}) translateY(${progress * 8}%)`;
        stage.style.opacity = String(1 - progress * 0.5);
        stage.style.filter = small ? "none" : `blur(${progress * 6}px)`;
        // Headline/CTAs fade and rise faster than the video so the text
        // clears out before the footage fully recedes. Same eased timeline
        // for both, with a real pixel distance so the rise is visible.
        const content = contentRef.current;
        if (content) {
          const p = clamp01(progress * 1.6);
          content.style.opacity = String(1 - p);
          content.style.transform = `translateY(-${p * 110}px)`;
        }
      }
      if (video && !reduce) {
        if (progress >= 0.99 && !video.paused) video.pause();
        else if (progress < 0.99 && video.paused) video.play().catch(() => {});
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
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
            preload="auto"
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
