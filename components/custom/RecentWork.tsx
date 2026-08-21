import { ProductImage } from "@/components/product/ProductImage";
import { Reveal } from "@/components/ui/Reveal";
import { recentWork } from "@/lib/data/recent-work";

const SIDEBAR_COUNT = 3;

/*
 * Sticky margin column beside the custom order form — a curated strip of
 * past jobs rather than the old site's single-photo slider. Placeholder
 * frames read as intentional until the owner's photos land in
 * lib/data/recent-work.ts. Below lg it compacts to a 2-up grid under the
 * form (third frame full-width).
 *
 * Deliberately the first three of the manifest, not all of it: the layout is
 * a composed three-frame arrangement, and the home page's deck is what grows
 * as the owner adds photos.
 */
export function RecentWork() {
  return (
    <aside className="self-start lg:sticky lg:top-24 lg:col-span-2">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        Recent Work
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:flex lg:flex-col lg:gap-6">
        {recentWork.slice(0, SIDEBAR_COUNT).map((photo, i) => (
          <Reveal
            key={i}
            delay={i * 90}
            className={
              i === 2 ? "col-span-2" : i === 1 ? "lg:ml-8" : undefined
            }
          >
            <figure>
              <ProductImage
                src={photo.src}
                alt={photo.alt}
                label={photo.label}
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
