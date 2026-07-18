import Image from "next/image";

/**
 * Renders product imagery, or a branded placeholder frame while the owner's
 * real photos are pending. The placeholder is intentional and swappable — the
 * moment a path lands in products.ts, it becomes a real optimized image.
 */
export function ProductImage({
  src,
  alt,
  label,
  className = "",
  sizes = "(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw",
  priority = false,
}: {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-surface ${className}`}
      role="img"
      aria-label={`${alt} — photo coming soon`}
    >
      {/* subtle field so the frame reads as intentional, not broken */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--ink) 0 1px, transparent 1px 11px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 text-center">
        <span
          aria-hidden
          className="h-2.5 w-2.5 rounded-full bg-ink/20"
        />
        {label && (
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ash">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
