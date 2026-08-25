"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/*
 * Catches anything a page throws below the root layout — most realistically a
 * failed Wix catalog read that the fallback in lib/data/products.ts couldn't
 * absorb. The header, footer, and cart survive, so the visitor keeps their
 * bearings and can carry on shopping instead of hitting a dead end.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // No error reporting service wired up yet — the digest is what correlates
    // this with the server log if something needs chasing down.
    console.error("[app] unhandled error", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-24 text-center sm:px-8">
      <span aria-hidden className="mx-auto block h-2.5 w-2.5 rounded-full bg-signal" />

      <h1 className="mt-8 font-display text-[clamp(1.8rem,4vw,2.4rem)] font-semibold tracking-tight text-ink">
        Something went wrong
      </h1>

      <p className="mx-auto mt-4 max-w-md text-pretty text-ink-soft">
        Sorry — that didn&apos;t load. It&apos;s us, not you. Try again, and if
        it keeps happening we&apos;d appreciate you letting us know.
      </p>

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Button onClick={() => retry()} variant="primary">
          Try again
        </Button>
        <Button href="/shop" variant="secondary">
          Back to the shop
        </Button>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-ash">
          Reference <span className="tabular-nums">{error.digest}</span>
        </p>
      )}
    </div>
  );
}
