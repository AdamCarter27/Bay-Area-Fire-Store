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
  const { addToCart } = useCart();

  const variant = product.variants.find((v) => v.id === variantId)!;
  const soldOut = !product.inStock || !variant.inStock;

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8">
      <div className="relative">
        <ProductImage
          src={product.image}
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
                // Sold-out options stay listed but unselectable, so the shopper
                // can see the size exists and is simply out.
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
