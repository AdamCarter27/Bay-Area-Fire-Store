import Link from "next/link";
import type { Product } from "@/lib/data/types";
import { ProductImage } from "./ProductImage";

const priceFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
});

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col"
    >
      <div className="relative">
        <ProductImage
          src={product.image}
          alt={product.title}
          label={product.category}
          priority={priority}
          className="aspect-[4/5] w-full rounded-lg border border-line transition-colors group-hover:border-line-strong"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-semibold text-ink shadow-sm backdrop-blur-sm">
            {product.badge}
          </span>
        )}
      </div>

      <h3 className="mt-3.5 font-display text-[0.98rem] font-medium leading-snug text-ink transition-colors group-hover:text-signal">
        {product.title}
      </h3>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-ash">
          {product.category}
        </span>
        <span className="text-sm font-medium tabular-nums text-ink-soft">
          {priceFmt.format(product.price)}
        </span>
      </div>
    </Link>
  );
}
