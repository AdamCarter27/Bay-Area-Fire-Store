"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { stickerDrop } from "@/lib/data/sticker-drop";

// Tune these by hand per sticker — index matches stickerWork order.
// overlap: how many px this sticker eats into the one before it (bigger = closer/more overlap)
// size: px, bounding box width/height
// liftY: vertical nudge in px (negative = higher, positive = lower)
// rotate: degrees
const STICKER_CONFIG = [
  { size: 500, overlap: 0, liftX: 780, liftY: 100,   rotate: -6 },
  { size: 720, overlap: 60, liftX: 320,  liftY: -270,  rotate: 4 },
  { size: 400, overlap: 90, liftX: 20, liftY: 170,  rotate: -8 },
  { size: 650, overlap: 100, liftX :-90,liftY: -150,   rotate: 40 },
  { size: 800, overlap: 90,  liftX: -400, liftY: -100,  rotate: -60 },
  { size: 400, overlap: 110, liftX: -580, liftY: -100,   rotate: 6 },
  { size: 350, overlap: 110, liftX: -800, liftY: 200,   rotate: 6 },
];

type FallingSticker = {
  id: number;
  rotate: number;
  delay: number;
  size: number;
  overlap: number;
  liftX: number;
  liftY: number;
  src: string;
};

function buildStickers(): FallingSticker[] {
  return STICKER_CONFIG.map((cfg, i) => {
    const photo = stickerDrop[i % stickerDrop.length];
    return {
      id: i,
      delay: i * 0.07,
      src: photo?.src ?? "",
      ...cfg,
    };
  });
}

export function StickerHero() {
  const [stickers, setStickers] = useState<FallingSticker[] | null>(null);
  const [dropped, setDropped] = useState(false);

  useEffect(() => {
    setStickers(buildStickers());
  }, []);

  useEffect(() => {
    if (!stickers) return;
    const t = requestAnimationFrame(() => setDropped(true));
    return () => cancelAnimationFrame(t);
  }, [stickers]);

  return (
    <section className="relative flex h-[70vh] min-h-[480px] w-full flex-col items-center overflow-hidden bg-ink">
      <div className="relative z-10 pt-16 text-center">
        <h1 className="font-display text-[clamp(2rem,6vw,3.4rem)] font-semibold tracking-tight text-paper">
          Custom Stickers
        </h1>
        <p className="mx-auto mt-3 max-w-md px-6 text-paper/70">
          Die-cut, kiss-cut, or holographic — designed and printed for your
          station, club, or event.
        </p>
      </div>

      <div className="absolute bottom-16 left-1/2 z-0 flex -translate-x-1/2 items-end">
        {stickers?.map((s, i) => (
            <div
                key={s.id}
                className="relative will-change-transform"
                style={{
                    width: s.size,
                    height: s.size,
                    marginLeft: i === 0 ? 0 : -s.overlap,
                    marginBottom: s.liftY,
                    zIndex: i,
                    transitionDelay: `${s.delay}s`,
                    transitionDuration: "900ms",
                    transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transitionProperty: "transform, opacity",
                    opacity: dropped ? 1 : 0,
                    transform: dropped
                        ? `translate(${s.liftX}px, 0) rotate(${s.rotate}deg)`
                        : `translate(${s.liftX}px, -60vh) rotate(${s.rotate}deg)`,
                }}
            >
            {s.src && (
              <Image
                src={s.src}
                alt=""
                fill
                sizes="280px"
                className="object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.45)]"
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() =>
          document.getElementById("sticker-form")?.scrollIntoView({ behavior: "smooth" })
        }
        className="absolute bottom-4 z-20 flex flex-col items-center gap-2 text-paper/70 transition-colors hover:text-paper"
      >
        <span className="text-xs uppercase tracking-[0.15em]">Start your order</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-bounce">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}