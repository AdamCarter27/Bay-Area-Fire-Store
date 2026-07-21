"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/products";
import { useCart } from "@/components/cart/CartContext";

export function ProductDetail({ product }: { product: Product }) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const { addToCart } = useCart();

  const variant = product.variants.find((v) => v.id === variantId)!;

  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-10 px-5 py-16 sm:grid-cols-2 sm:px-8">
      <div className="flex aspect-square items-center justify-center rounded-xl bg-surface text-sm text-ash">
        Product photo
      </div>
      <div>
        <p className="text-xs capitalize text-ash">{product.category}</p>
        <h1 className="mt-1 font-display text-2xl font-semibold text-ink">
          {product.title}
        </h1>
        <p className="mt-2 text-lg text-ink">${variant.price.toFixed(2)}</p>

        {product.variants.length > 1 && (
          <div className="mt-6">
            <label className="text-sm font-medium text-ink">Size</label>
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="mt-2 block w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink"
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={() => addToCart(product, variant)}
          className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}