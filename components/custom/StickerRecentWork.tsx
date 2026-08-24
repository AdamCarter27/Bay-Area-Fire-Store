import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { stickerWork } from "@/lib/data/sticker-work";

export function StickerRecentWork() {
  return (
    <aside className="self-start lg:sticky lg:top-24 lg:col-span-2">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        Recent Work
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:gap-6">
        {stickerWork.map((photo, i) => (
          <Reveal
            key={i}
            delay={i * 90}
            className={i === 2 ? "col-span-2" : i === 1 ? "lg:ml-8" : undefined}
          >
            <figure>
              <ProductImage
                src={photo.src}
                alt="Recent sticker work"
                sizes="(min-width: 1024px) 34vw, 45vw"
                className="aspect-[4/3] w-full rounded-lg border border-line"
              />
            </figure>
          </Reveal>
        ))}
      </div>
    </aside>
  );
}