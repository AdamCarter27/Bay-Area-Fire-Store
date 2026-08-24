"use client";

import { useEffect, useState } from "react";
import { ProductImage } from "@/components/product/ProductImage";
import { stickerWork } from "@/lib/data/sticker-work";

type FallingSticker = {
  id: number;
  left: string;
  rotate: number;
  delay: number;
  size: number;
  src: string;
};

function generateStickers(count: number): FallingSticker[] {
  return Array.from({ length: count }, (_, i) => {
    const photo = stickerWork[i % stickerWork.length];
    return {
      id: i,
      left: `${(i / count) * 90 + Math.random() * 6}%`,
      rotate: Math.random() * 50 - 25,
      delay: Math.random() * 0.6,
      size: 90 + Math.random() * 50,
      src: photo?.src ?? "",
    };
  });
}

export function StickerHero() {
  const [stickers, setStickers] = useState<FallingSticker[] | null>(null);
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    setStickers(generateStickers(9));
  }, []);

  useEffect(() => {
    if (!stickers) return;
    const t = requestAnimationFrame(() => setDropped(true));
    return () => cancelAnimationFrame(t);
  }, [stickers]);

  return (
    <section className="relative flex h-[70vh] min-h-[420px] w-full flex-col items-center justify-center overflow-hidden bg-ink">
      {stickers?.map((s) => (
        <div
          key={s.id}
          className="absolute top-0 will-change-transform"
          style={{
            left: s.left,
            width: s.size,
            height: s.size,
            transitionDelay: `${s.delay}s`,
            transitionDuration: "900ms",
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
            transitionProperty: "transform",
            transform: dropped
              ? `translateY(${38 + s.delay * 10}vh) rotate(${s.rotate}deg)`
              : `translateY(-20vh) rotate(${s.rotate}deg)`,
          }}
        >
          <ProductImage
            src={s.src}
            alt=""
            label="Sticker"
            sizes="140px"
            className="aspect-square w-full rounded-xl border-2 border-paper shadow-lg"
          />
        </div>
      ))}

      <div className="relative z-10 text-center">
        <h1 className="font-display text-[clamp(2rem,6vw,3.4rem)] font-semibold tracking-tight text-paper">
          Custom Stickers
        </h1>
        <p className="mx-auto mt-3 max-w-md px-6 text-paper/70">
          Die-cut, kiss-cut, or holographic — designed and printed for your
          station, club, or event.
        </p>
      </div>

      <button
        type="button"
        onClick={() =>
          document.getElementById("sticker-form")?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-8 z-10 flex flex-col items-center gap-2 text-paper/70 transition-colors hover:text-paper"
      >
        <span className="text-xs uppercase tracking-[0.15em]">Start your order</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-bounce">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}