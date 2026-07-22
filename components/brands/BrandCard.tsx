import Link from "next/link";
import { ProductImage } from "@/components/product/ProductImage";
import type { Brand } from "@/lib/data/brands";

export function BrandCard({
  brand,
  featured = false,
}: {
  brand: Brand;
  featured?: boolean;
}) {
  return (
    <Link href={`/shop?brand=${brand.slug}`} className="group flex flex-col">
      <div className="relative overflow-hidden rounded-lg border border-line transition-colors group-hover:border-line-strong">
        <ProductImage
          src=""
          alt={brand.label}
          label={brand.label}
          sizes="(min-width: 640px) 25vw, 45vw"
          className={`w-full transition-transform duration-500 ease-out group-hover:scale-105 ${
            featured ? "aspect-square" : "aspect-square"
          }`}
        />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-ink/85 via-ink/50 to-ink/0 px-4 pb-4 pt-10 opacity-0 transition-opacity duration-300 ease-out can-hover:group-hover:opacity-100">
          <span
            className={`w-fit rounded-full bg-paper font-medium text-ink ${
              featured ? "px-4 py-2 text-sm" : "px-3 py-1.5 text-xs"
            }`}
          >
            Shop {brand.label}
          </span>
        </div>
      </div>

      <h3
        className={`mt-3 font-display leading-snug text-ink transition-colors group-hover:text-signal ${
          featured ? "text-base" : "text-sm"
        }`}
      >
        {brand.label}
      </h3>
    </Link>
  );
}