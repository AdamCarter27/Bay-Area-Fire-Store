"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/types";
import { useCart } from "@/components/cart/CartContext";
import { ProductImage } from "@/components/product/ProductImage";

export function ProductDetail({ product }: { product: Product }) {
  // Open on something the shopper can actually buy — landing on a sold-out
  // size makes a stocked product look unavailable.
  const [variantId, setVariantId] = useState(
    (product.variants.find((v) => v.inStock) ?? product.variants[0]).id
  );
  // NEW: tracks which photo index is currently shown, instead of the photo
  // itself — makes prev/next arithmetic simple (just +1 / -1, wrapping).
  const [activeIndex, setActiveIndex] = useState(0);
  const { addToCart } = useCart();

  const variant = product.variants.find((v) => v.id === variantId)!;
  const soldOut = !product.inStock || !variant.inStock;

  // NEW: wrap around both ends so clicking never dead-ends the gallery.
  const showPrev = () =>
    setActiveIndex((i) => (i === 0 ? product.images.length - 1 : i - 1));
  const showNext = () =>
    setActiveIndex((i) => (i === product.images.length - 1 ? 0 : i + 1));

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8">
      <div className="relative">
        <ProductImage
          // NEW: reads the current index from product.images instead of the
          // single product.image field.
          src={product.images[activeIndex]}
          alt={product.title}
          label={product.categories[0]}
          priority
          sizes="(min-width: 640px) 45vw, 90vw"
          className={`aspect-square w-full rounded-xl border border-line ${
            product.inStock ? "" : "opacity-60"
          }`}
        />
        {!product.inStock && (
          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-semibold text-ash shadow-sm backdrop-blur-sm">
            Sold out
          </span>
        )}

        {/* NEW: prev/next arrows, only shown when there's more than one photo. */}
        {product.images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrev}
              aria-label="Previous photo"
              className="absolute bottom-3 right-14 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-opacity hover:opacity-80"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={showNext}
              aria-label="Next photo"
              className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-opacity hover:opacity-80"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
        {/* END NEW */}
      </div>
      <div>
        <p className="text-xs capitalize text-ash">{product.categories[0]}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          {product.title}
        </h1>
        <p className="mt-2 text-lg text-ink">${variant.price.toFixed(2)}</p>

        {product.description && (
          <p className="mt-4 text-pretty text-sm leading-relaxed text-ink-soft">
            {product.description}
          </p>
        )}

        {product.variants.length > 1 && (
          <div className="mt-6">
            <label htmlFor="variant" className="text-sm font-medium text-ink">
              Size
            </label>
            <select
              id="variant"
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="mt-2 block w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id} disabled={!v.inStock}>
                  {v.title}
                  {v.inStock ? "" : " — sold out"}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => addToCart(product, variant)}
          disabled={soldOut}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? "Sold out" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}