"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export default function CartPage() {
  const { items, removeFromCart } = useCart();
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-16 text-center sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Cart</h1>
        <p className="mt-4 text-ash">Your cart is empty.</p>
        <Link href="/shop" className="mt-6 inline-block text-ink underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Cart</h1>
      <div className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={`${item.slug}-${item.variantId}`}
            className="flex items-center justify-between border-b border-line pb-4"
          >
            <div>
              <h3 className="font-medium text-ink">{item.title}</h3>
              <p className="text-sm text-ash">
                {item.variantTitle} · Qty {item.quantity} · ${item.price.toFixed(2)} each
              </p>
            </div>
            <button
              onClick={() => removeFromCart(item.slug, item.variantId)}
              className="text-sm text-signal underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-right text-lg font-medium text-ink">
        Total: ${total.toFixed(2)}
      </p>
    </div>
  );
}