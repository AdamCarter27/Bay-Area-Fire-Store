"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/components/cart/CartContext";
import { startWixCheckout } from "@/lib/wix/checkout";
import {
  FREE_SHIPPING_THRESHOLD,
  shippingFor,
} from "@/lib/data/shipping";
import {
  isCartItemUnavailable,
  type CartStock,
} from "@/lib/data/cart-stock";

export function CartView({ stock }: { stock: CartStock }) {
  const { items, removeFromCart, updateQuantity } = useCart();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  /*
   * Split the cart by what Wix will still sell. Sold-out lines stay visible
   * rather than being silently dropped — a cart that empties itself between
   * visits looks broken, and the shopper may want to note what they lost.
   */
  const unavailable = items.filter((item) => isCartItemUnavailable(stock, item));
  const hasUnavailable = unavailable.length > 0;

  /*
   * Payment happens on Wix, not here. This hands the line items over and sends
   * the browser to the checkout Wix builds for them.
   */
  const handleCheckout = async () => {
    /*
     * Belt and braces: the button is disabled in this state, but a stale
     * client or a fast click should not get as far as Wix rejecting the whole
     * checkout with an error that names no item.
     */
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
      // Not router.push: this leaves our app for a Wix-hosted page.
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
  /*
   * Sold-out lines are excluded from the totals: checkout is blocked until
   * they are removed, so quoting a number that includes them would be quoting
   * a total nobody can pay.
   */
  const subtotal = items
    .filter((item) => !isCartItemUnavailable(stock, item))
    .reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Mirrors the owner's Wix shipping profile so this figure matches what the
  // checkout actually charges — see lib/data/shipping.ts. Tax is deliberately
  // absent: it depends on the delivery address, which Wix collects.
  const shipping = shippingFor(subtotal);
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

            return (
            <div
              key={`${item.slug}-${item.variantId}`}
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
                        updateQuantity(item.slug, item.variantId, item.quantity - 1)
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
                        updateQuantity(item.slug, item.variantId, item.quantity + 1)
                      }
                      disabled={soldOut}
                      className="flex h-8 w-8 items-center justify-center text-ink disabled:opacity-30"
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
              <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
          </div>

          {shipping > 0 && (
            <p className="mt-3 text-xs text-ash">
              Add ${(FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.
            </p>
          )}

          {/* "Estimated" because tax is still to come — quoting a bare "Total"
              here and then charging more at Wix is the kind of surprise that
              loses the sale at the last step. */}
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