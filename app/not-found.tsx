import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/*
 * Every 404 lands here, including `notFound()` from a product page whose slug
 * no longer exists — which happens on its own as the owner retires products,
 * so this is a normal state rather than an edge case. Route them back into the
 * catalog instead of leaving them at a dead end.
 */
export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="font-display text-5xl font-semibold tracking-tight text-ink">
        404
      </p>

      <h1 className="mt-4 font-display text-[clamp(1.6rem,3.5vw,2.2rem)] font-semibold tracking-tight text-ink">
        We couldn&apos;t find that page
      </h1>

      <p className="mx-auto mt-4 max-w-md text-pretty text-ink-soft">
        The link may be out of date, or the product may no longer be in stock.
        The shop is the best place to pick things back up.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button href="/shop" variant="primary">
          Shop all products
        </Button>
        <Button href="/contact" variant="secondary">
          Get in touch
        </Button>
      </div>
    </div>
  );
}
