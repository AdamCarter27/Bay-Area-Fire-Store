"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";

const SHIPPING_FLAT_RATE = 8;
const FREE_SHIPPING_THRESHOLD = 150;

export default function CartPage() {
  const { items, removeFromCart, updateQuantity } = useCart();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
    ? 0
    : SHIPPING_FLAT_RATE;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Cart</h1>
        <p className="mt-4 text-ash">Your cart is empty.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Cart</h1>

      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_340px]">
        {/* Line items */}
        <div className="flex flex-col divide-y divide-line">
          {items.map((item) => (
            <div
              key={`${item.slug}-${item.variantId}`}
              className="flex gap-5 py-6 first:pt-0"
            >
              <Link
                href={`/product/${item.slug}`}
                className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface"
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-ash">
                    No photo
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/product/${item.slug}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-sm text-ash">{item.variantTitle}</p>
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.slug, item.variantId, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center text-ink disabled:opacity-30"
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className="w-6 text-center text-sm text-ink">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.slug, item.variantId, item.quantity + 1)
                      }
                      className="flex h-8 w-8 items-center justify-center text-ink"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.slug, item.variantId)}
                    className="text-sm text-ash underline transition-colors hover:text-signal"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="shrink-0 font-medium text-ink">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-line p-6">
          <h2 className="font-display text-lg font-semibold text-ink">Summary</h2>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between text-ink-soft">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-ink-soft">
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="mt-3 text-xs text-ash">
              Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.
            </p>
          )}

          <div className="mt-4 flex justify-between border-t border-line pt-4 text-base font-semibold text-ink">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <button className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90">
            Checkout
          </button>

          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-ash underline"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}