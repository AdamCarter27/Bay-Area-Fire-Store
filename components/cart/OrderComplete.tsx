"use client";

import { useEffect, useRef } from "react";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/components/cart/CartContext";

/*
 * The landing spot after a completed Wix checkout. Wix only sends a shopper
 * here once the purchase is done, so this is where the local cart gets emptied
 * — deliberately not on the abandon path, which returns to /cart with the cart
 * still intact.
 */
export function OrderComplete({ orderId }: { orderId?: string }) {
  const { clearCart, hydrated } = useCart();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cleared = useRef(false);

  useEffect(() => {
    // Wait for the stored cart to load, or clearCart would run against empty
    // state and the real one would be written back over it a tick later.
    if (!hydrated || cleared.current) return;
    cleared.current = true;
    clearCart();
  }, [hydrated, clearCart]);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-24 text-center sm:px-8">
      <FiCheckCircle aria-hidden className="mx-auto h-10 w-10 text-ink" />

      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink"
      >
        Thank you for your order
      </h1>

      <p className="mt-4 text-pretty text-ink-soft">
        Your order is confirmed and a receipt is on its way to your inbox. We
        will email you again as soon as it ships.
      </p>

      {orderId && (
        <p className="mt-4 text-sm text-ash">
          Order reference{" "}
          <span className="font-medium tabular-nums text-ink">{orderId}</span>
        </p>
      )}

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button href="/shop" variant="primary">
          Keep shopping
        </Button>
        <Button href="/contact" variant="secondary">
          Questions about your order
        </Button>
      </div>
    </div>
  );
}
