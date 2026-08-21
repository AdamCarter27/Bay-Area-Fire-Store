"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";
import { ProductImage } from "@/components/product/ProductImage";

export function AddedToCartPopup() {
  const { lastAdded, clearLastAdded, items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  // Auto-dismiss so it doesn't linger if the shopper just keeps browsing.
  useEffect(() => {
    if (!lastAdded) return;
    const timer = setTimeout(clearLastAdded, 5000);
    return () => clearTimeout(timer);
  }, [lastAdded, clearLastAdded]);

  if (!lastAdded) return null;

  return (
    <div className="fixed right-4 top-20 z-50 w-80 rounded-lg border border-line bg-paper p-4 shadow-lg sm:right-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink">Added to cart</p>
        <button
          onClick={clearLastAdded}
          aria-label="Dismiss"
          className="text-ash hover:text-ink"
        >
          ×
        </button>
      </div>

      <div className="mt-3 flex gap-3">
        <ProductImage
          src={lastAdded.image}
          alt={lastAdded.title}
          className="h-16 w-16 shrink-0 rounded-md border border-line"
          sizes="64px"
        />
        <div className="min-w-0">
          <p className="truncate text-sm text-ink">{lastAdded.title}</p>
          <p className="text-xs text-ash">{lastAdded.variantTitle}</p>
          <p className="text-xs text-ash">${lastAdded.price.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <Link
          href="/cart"
          onClick={clearLastAdded}
          className="rounded-full border border-line-strong px-4 py-2 text-center text-sm font-medium text-ink hover:border-ink"
        >
          View cart ({count})
        </Link>
        <Link
          href="/checkout"
          onClick={clearLastAdded}
          className="rounded-full bg-ink px-4 py-2 text-center text-sm font-medium text-paper hover:opacity-90"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}