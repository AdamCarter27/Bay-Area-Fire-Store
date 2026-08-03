"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export function CartLink({ light }: { light: boolean }) {
  const { items, hydrated } = useCart();
  // Hold the count back until the saved cart is read, so a returning shopper
  // sees "Cart" then "Cart (3)" rather than a count that appears to reset.
  const count = hydrated
    ? items.reduce((sum, item) => sum + item.quantity, 0)
    : 0;

  return (
    <Link
      href="/cart"
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        light
          ? "border-paper/40 text-paper hover:border-paper"
          : "border-line-strong text-ink hover:border-ink"
      }`}
    >
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}