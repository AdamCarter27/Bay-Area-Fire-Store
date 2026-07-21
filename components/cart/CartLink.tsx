"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartContext";

export function CartLink({ light }: { light: boolean }) {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

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