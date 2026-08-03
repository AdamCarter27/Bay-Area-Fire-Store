import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout — Bay Area Fire Store",
  description: "Review your order and check out.",
  // Nothing to index, and a crawler following a cart link into checkout is
  // only noise in search results.
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
