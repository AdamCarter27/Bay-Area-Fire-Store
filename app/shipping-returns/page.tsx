import type { Metadata } from "next";
import {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_FLAT_RATE,
} from "@/lib/data/shipping";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description:
    "Shipping rates, delivery times, and the return and exchange policy for Bay Area Fire Store orders.",
};

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
      <h1 className="text-center font-display text-[clamp(2rem,5vw,3rem)] font-semibold tracking-tight text-ink">
        Shipping &amp; Returns
      </h1>

      <h2 className="mt-12 font-display text-xl font-semibold text-ink">
        Shipping policy
      </h2>
      {/* Rates come from lib/data/shipping.ts, the same source the cart uses,
          so this page can't drift from what the checkout actually charges. */}
      <p className="mt-3 text-pretty text-ink-soft">
        Shipping is a flat ${SHIPPING_FLAT_RATE.toFixed(2)} on orders under $
        {FREE_SHIPPING_THRESHOLD.toFixed(2)}, and free on orders of $
        {FREE_SHIPPING_THRESHOLD.toFixed(2)} or more. Your exact shipping cost
        and any applicable tax are calculated at checkout, once you enter a
        delivery address.
      </p>
      <p className="mt-3 text-pretty text-ink-soft">
        Most orders are processed within 1–7 business days. Custom and
        personalized work — embroidery, screen printing, stickers — takes longer
        depending on the job, and we&apos;ll give you a timeline when we confirm
        your order.
      </p>

      <h2 className="mt-10 font-display text-xl font-semibold text-ink">
        Returns &amp; exchanges
      </h2>
      <p className="mt-3 text-pretty text-ink-soft">
        All sales are final. If your order arrives damaged or defective, contact
        us and we&apos;ll make it right. Return shipping on defective items is
        the customer&apos;s responsibility.
      </p>
      <p className="mt-3 text-pretty text-ink-soft">
        Custom and personalized items can&apos;t be returned or exchanged, since
        they&apos;re made specifically for you.
      </p>

      <h2 className="mt-10 font-display text-xl font-semibold text-ink">
        Questions
      </h2>
      <p className="mt-3 text-pretty text-ink-soft">
        Email us at{" "}
        <a
          href="mailto:Info@bayareafirestore.com"
          className="font-medium text-ink underline underline-offset-2 transition-colors hover:text-signal"
        >
          Info@bayareafirestore.com
        </a>{" "}
        or use the{" "}
        <a
          href="/contact"
          className="font-medium text-ink underline underline-offset-2 transition-colors hover:text-signal"
        >
          contact form
        </a>
        .
      </p>
    </div>
  );
}
