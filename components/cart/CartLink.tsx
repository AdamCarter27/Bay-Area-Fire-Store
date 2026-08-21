"use client";

import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";
import { useCart } from "@/components/cart/CartContext";

export function CartLink({ light }: { light: boolean }) {
  const { items, hydrated } = useCart();
  // Hold the count back until the saved cart is read, so a returning shopper
  // sees the bare icon then a badge appears, rather than a count that
  // appears to reset.
  const count = hydrated
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
      className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
        light
          ? "border-paper/40 text-paper hover:border-paper"
          : "border-line-strong text-ink hover:border-ink"
      }`}
    >
      <FiShoppingBag className="h-4 w-4" aria-hidden />
      {count > 0 && (
        <span
          aria-hidden
          className={`absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.65rem] font-medium ${
            light ? "bg-paper text-ink" : "bg-ink text-paper"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}