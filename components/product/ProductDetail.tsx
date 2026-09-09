"use client";

import { useState, useEffect } from "react";
import type { Product } from "@/lib/data/types";
import { useCart } from "@/components/cart/CartContext";
import { ProductImage } from "@/components/product/ProductImage";

export function ProductDetail({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(
    (product.variants.find((v) => v.inStock) ?? product.variants[0]).id
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const { addToCart } = useCart();

  const variant = product.variants.find((v) => v.id === variantId)!;
  const soldOut = !product.inStock || !variant.inStock;

  const images = product.images ?? [];
  const showPrev = () =>
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const showNext = () =>
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  // Close on Escape, lock page scroll while open
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {images.length > 1 && (
          <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col sm:overflow-visible">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`View photo ${i + 1}`}
                className={`shrink-0 overflow-hidden rounded-lg border transition-colors ${
                  i === activeIndex
                    ? "border-ink"
                    : "border-line hover:border-line-strong"
                }`}
              >
                <ProductImage
                  src={img}
                  alt={`${product.title} thumbnail ${i + 1}`}
                  sizes="64px"
                  className="h-16 w-16 object-cover"
                />
              </button>
            ))}
          </div>
        )}

        <div className="relative order-1 min-w-0 flex-1 sm:self-start sm:order-2">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="View full-size photo"
            className="block w-full cursor-zoom-in"
          >
            <ProductImage
              src={images[activeIndex]}
              alt={product.title}
              label={product.categories[0]}
              priority
              sizes="(min-width: 640px) 45vw, 90vw"
              className={`aspect-square w-full rounded-xl border border-line ${
                product.inStock ? "" : "opacity-60"
              }`}
            />
          </button>
          {!product.inStock && (
            <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.7rem] font-semibold text-ash shadow-sm backdrop-blur-sm">
              Sold out
            </span>
          )}

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrev}
                aria-label="Previous photo"
                className="absolute bottom-3 right-14 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-opacity hover:opacity-80"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={showNext}
                aria-label="Next photo"
                className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink shadow-md transition-opacity hover:opacity-80"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          )}
        </div>
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

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/90 p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md hover:opacity-80"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className="relative max-h-[90vh] w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <ProductImage
              src={images[activeIndex]}
              alt={product.title}
              sizes="90vw"
              className="aspect-square w-full rounded-xl"
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrev}
                  aria-label="Previous photo"
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md hover:opacity-80"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={showNext}
                  aria-label="Next photo"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-paper text-ink shadow-md hover:opacity-80"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}