"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MAX_QUANTITY, useCart } from "@/components/cart/CartContext";
import {calculateTotals } from "@/lib/start-checkout";

export default function CartPage() {
  const { items, hydrated, removeFromCart, updateQuantity } = useCart();
  const { subtotal, shipping } = calculateTotals(items);
  // Tax is deliberately left off the cart — it depends on the shipping address,
  // which we don't have until checkout. The checkout summary adds it.
  const totalBeforeTax = subtotal + shipping;

  // The saved cart hasn't been read yet — say nothing rather than flash
  // "your cart is empty" at someone who has three things in it.
  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Cart</h1>
        <p className="mt-4 text-sm text-ash" role="status">
          Loading your cart…
        </p>
      </div>
    );
  }

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

      <ul className="mt-8 flex flex-col gap-4">
        {items.map((item) => (
          <li
            key={`${item.slug}-${item.variantId}`}
            className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4"
          >
            <div className="min-w-0">
              <h2 className="font-medium text-ink">
                <Link href={`/product/${item.slug}`} className="hover:underline">
                  {item.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-ash">
                {item.variantTitle} · ${item.price.toFixed(2)} each
              </p>
              <button
                type="button"
                onClick={() => removeFromCart(item.slug, item.variantId)}
                className="mt-2 text-sm text-ash underline transition-colors hover:text-ink"
              >
                Remove
                <span className="sr-only"> {item.title}</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <QuantityStepper
                label={item.title}
                quantity={item.quantity}
                onChange={(next) =>
                  updateQuantity(item.slug, item.variantId, next)
                }
              />
              <p className="w-20 text-right font-medium text-ink">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-8 flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ash">Subtotal</dt>
          <dd className="text-ink">${subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ash">Shipping</dt>
          <dd className="text-ink">
            {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
          </dd>
        </div>
        <div className="flex justify-between border-t border-line pt-3 text-base">
          <dt className="font-medium text-ink">Total before tax</dt>
          <dd className="font-medium text-ink">${totalBeforeTax.toFixed(2)}</dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/shop" className="text-sm text-ink underline">
          Continue shopping
        </Link>
        <Button href="/checkout" size="lg">
          Checkout
        </Button>
      </div>
    </div>
  );
}

function QuantityStepper({
  label,
  quantity,
  onChange,
}: {
  label: string;
  quantity: number;
  onChange: (next: number) => void;
}) {
  const stepperButton =
    "flex h-8 w-8 items-center justify-center text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:text-ash";

  return (
    <div className="flex items-center rounded-full border border-line-strong">
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        className={`${stepperButton} rounded-l-full`}
        aria-label={`Decrease quantity of ${label}`}
      >
        −
      </button>
      <span
        aria-live="polite"
        className="w-8 text-center text-sm tabular-nums text-ink"
      >
        {quantity}
        <span className="sr-only"> of {label} in cart</span>
      </span>
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={quantity >= MAX_QUANTITY}
        className={`${stepperButton} rounded-r-full`}
        aria-label={`Increase quantity of ${label}`}
      >
        +
      </button>
    </div>
  );
}
