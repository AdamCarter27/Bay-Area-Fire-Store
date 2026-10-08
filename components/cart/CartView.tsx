"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart, lineKey } from "@/components/cart/CartContext";
import { startWixCheckout } from "@/lib/wix/checkout";
import {
  FREE_SHIPPING_THRESHOLD,
  shippingFor,
} from "@/lib/data/shipping";
import {
  isCartItemUnavailable,
  type CartStock,
} from "@/lib/data/cart-stock";
import { isWixMediaUrl } from "@/lib/wix/image-loader";

// Exact Wix option name/value this product uses for event pickup — must match
// what's configured in Wix exactly, including capitalization.
const PICKUP_OPTION_NAME = "Pick up at event";
const PICKUP_OPTION_VALUE = "Yes";

export function CartView({ stock }: { stock: CartStock }) {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  const unavailable = items.filter((item) => isCartItemUnavailable(stock, item));
  const hasUnavailable = unavailable.length > 0;

  const handleCheckout = async () => {
    if (hasUnavailable) {
      setCheckoutError(
        "Remove the sold-out items above before checking out."
      );
      return;
    }

    setCheckoutError(null);
    setRedirecting(true);
    try {
      const url = await startWixCheckout(items);
      window.location.assign(url);
    } catch (error) {
      console.error("[checkout] could not start Wix checkout", error);
      setCheckoutError(
        error instanceof Error && error.message
          ? error.message
          : "We couldn't start checkout. Please try again."
      );
      setRedirecting(false);
    }
  };

  const shippableItems = items.filter(
    (item) => !isCartItemUnavailable(stock, item) && !item.isCustom
  );

  const subtotal = shippableItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /*
   * If every shippable line in the cart is a pickup-selected item, the real
   * Wix checkout will offer it free via the Fundraiser Event delivery
   * profile — so show $0 here too rather than quoting a paid estimate that
   * doesn't match what the shopper will actually see at checkout.
   *
   * A cart mixing a pickup item with a normal shippable item still falls
   * back to the paid estimate: the non-pickup item needs real shipping
   * regardless, so showing "Free" for the whole cart would be wrong.
   */
  const allPickup =
    shippableItems.length > 0 &&
    shippableItems.every(
      (item) => item.choices?.[PICKUP_OPTION_NAME] === PICKUP_OPTION_VALUE
    );

  const shipping = allPickup ? 0 : shippingFor(subtotal);
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
          {items.map((item) => {
            const soldOut = isCartItemUnavailable(stock, item);
            const key = lineKey(item);
            const customText = Object.entries(item.customText ?? {});

            return (
            <div
              key={key}
              className="flex gap-5 py-6 first:pt-0"
            >
              <Link
                href={`/product/${item.slug}`}
                className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-surface ${
                  soldOut ? "opacity-40" : ""
                }`}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    unoptimized={!isWixMediaUrl(item.image)}
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
                  {customText.map(([title, value]) => (
                    <p key={title} className="mt-1 text-xs text-ash">
                      <span className="font-medium">{title}</span> {value}
                    </p>
                  ))}
                  {soldOut && (
                    <p className="mt-1.5 text-sm font-medium text-signal">
                      Sold out — remove to check out
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-4">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(key, item.quantity - 1)
                      }
                      disabled={soldOut || item.quantity <= 1}
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
                        updateQuantity(key, item.quantity + 1)
                      }
                      disabled={soldOut}
                      className="flex h-8 w-8 items-center justify-center text-ink disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(key)}
                    className="text-sm text-ash underline transition-colors hover:text-signal"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p
                className={`shrink-0 font-medium ${
                  soldOut ? "text-ash line-through" : "text-ink"
                }`}
              >
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
            );
          })}
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
              <span>
                {shipping === 0
                  ? allPickup
                    ? "Free — pickup at event"
                    : "Free"
                  : `$${shipping.toFixed(2)}`}
              </span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="mt-3 text-xs text-ash">
              Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.
            </p>
          )}

          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4 text-base font-semibold text-ink">
            <span>Estimated total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <p className="mt-1.5 text-xs text-ash">Tax calculated at checkout.</p>

          {checkoutError && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-signal/40 bg-signal/5 px-3 py-2.5 text-xs text-ink"
            >
              {checkoutError}
            </p>
          )}

          {hasUnavailable && (
            <p
              role="alert"
              className="mt-4 rounded-md border border-signal/40 bg-signal/5 px-3 py-2.5 text-xs text-ink"
            >
              {unavailable.length === 1
                ? "One item in your cart sold out while it was there."
                : `${unavailable.length} items in your cart sold out while they were there.`}{" "}
              Remove {unavailable.length === 1 ? "it" : "them"} to continue.
            </p>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={redirecting || hasUnavailable}
            className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-medium text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {hasUnavailable
              ? "Remove sold-out items to continue"
              : redirecting
              ? "Taking you to checkout…"
              : "Checkout"}
          </button>

          <p className="mt-3 text-center text-xs text-ash">
            You&apos;ll pay securely on our Wix-hosted checkout.
          </p>

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