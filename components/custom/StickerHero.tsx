"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { stickerDrop } from "@/lib/data/sticker-drop";

// Desktop pile — tune freely, wide-screen numbers.
const STICKER_CONFIG = [
  { size: 500, overlap: 0, liftX: 780, liftY: -110, rotate: -6 },
  { size: 720, overlap: 60, liftX: 360, liftY: 260, rotate: 4 },
  { size: 400, overlap: 90, liftX: 50, liftY: -190, rotate: -8 },
  { size: 650, overlap: 100, liftX: -90, liftY: 190, rotate: 40 },
  { size: 800, overlap: 90, liftX: -400, liftY: 70, rotate: 50 },
  { size: 400, overlap: 110, liftX: -580, liftY: 70, rotate: 6 },
  { size: 350, overlap: 110, liftX: -820, liftY: -190, rotate: 30 },
];

// Mobile pile — same idea, its own numbers. A phone viewport is roughly
// 350–420px wide, so liftX needs to stay in a much smaller range or stickers
// run off-screen. Tune this set by hand on your phone the same way you tuned
// the desktop one — start small and nudge from here.
const MOBILE_STICKER_CONFIG = [
  { size: 200, overlap: 0, liftX: 390, liftY: -230, rotate: -6 },
  { size: 260, overlap: 0, liftX: 190, liftY: -100, rotate: 4 },
  { size: 150, overlap: 0, liftX: 60, liftY: -260, rotate: -8 },
  { size: 200, overlap: 0, liftX: -60, liftY: -130, rotate: 20 },
  { size: 240, overlap: 25, liftX: -200, liftY: -220, rotate: 50 },
  { size: 180, overlap: 30, liftX: -300, liftY: -145, rotate: 6 },
  { size: 120, overlap: 30, liftX: -405, liftY: -260, rotate: 40 },
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

function buildStickers(config: typeof STICKER_CONFIG): FallingSticker[] {
  return config.map((cfg, i) => {
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = window.innerWidth < 640;
    setIsMobile(mobile);
    setStickers(buildStickers(mobile ? MOBILE_STICKER_CONFIG : STICKER_CONFIG));

    const check = () => {
      const nowMobile = window.innerWidth < 640;
      setIsMobile((prev) => {
        if (prev !== nowMobile) {
          setStickers(buildStickers(nowMobile ? MOBILE_STICKER_CONFIG : STICKER_CONFIG));
        }
        return nowMobile;
      });
    };
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!stickers) return;
    setDropped(false);
    const t = requestAnimationFrame(() => setDropped(true));
    return () => cancelAnimationFrame(t);
  }, [stickers]);

  return (
    <section className="relative flex w-full flex-col items-center overflow-hidden bg-ink py-8 sm:h-[70vh] sm:min-h-[480px] sm:py-0">
    <div className="relative z-20 text-center sm:pt-16">
    <h1 className="font-display text-[clamp(1.8rem,7vw,3.4rem)] font-extrabold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
        Custom Stickers
    </h1>
    <p className="mx-auto mt-3 max-w-md px-6 text-sm font-medium text-white/90 drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] sm:text-base">
        Die-cut, kiss-cut, or holographic — designed and printed for your
        station, club, or event.
    </p>
    </div>

  <div
    className={
      isMobile
        ? "relative z-0 mt-4 flex items-end justify-center"
        : "absolute bottom-16 left-1/2 z-0 flex -translate-x-1/2 items-end"
    }
    style={isMobile ? { marginBottom: -220 } : undefined}
  >
        {stickers?.map((s, i) => (
          <div
            key={s.id}
            className="relative will-change-transform"
            style={{
              width: s.size,
              height: s.size,
              marginLeft: i === 0 ? 0 : -s.overlap,
              zIndex: i,
              transitionDelay: `${s.delay}s`,
              transitionDuration: "900ms",
              transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              transitionProperty: "transform, opacity",
              opacity: dropped ? 1 : 0,
              transform: dropped
                ? `translate(${s.liftX}px, ${s.liftY}px) rotate(${s.rotate}deg)`
                : `translate(${s.liftX}px, ${isMobile ? "-30vh" : "-60vh"}) rotate(${s.rotate}deg)`,
            }}
          >
            {s.src && (
              <Image
                src={s.src}
                alt=""
                fill
                sizes={isMobile ? "170px" : "280px"}
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
        className="relative z-20 mt-6 flex flex-col items-center gap-2 text-white/70 transition-colors hover:text-paper sm:absolute sm:bottom-4 sm:mt-0"
      >
        <span className="text-[11px] uppercase tracking-[0.15em] sm:text-xs">
          Start your order
        </span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="animate-bounce">
          <path d="M12 4v16m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </section>
  );
}