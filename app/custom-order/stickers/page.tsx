import { StickerHero } from "@/components/custom/StickerHero";
import { StickerOrderForm } from "@/components/custom/StickerOrderForm";
import { StickerRecentWork } from "@/components/custom/StickerRecentWork";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Custom Stickers",
  description:
    "Die-cut, kiss-cut, holographic, and clear custom stickers for fire departments, stations, and crews across the Bay Area.",
};

export default function CustomStickerPage() {
  /*
   * Parked at the owner's request for launch — the page 404s but the code
   * stays. To relaunch: delete this notFound(), restore the header link in
   * SiteHeader.tsx and the /custom-order/stickers entry in app/sitemap.ts.
   */
  notFound();

  return (
    <>
      <StickerHero />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <section id="sticker-form" className="scroll-mt-24 py-16 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <SplitHeadline
                as="h2"
                className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink"
              >
                Start Your Sticker Order
              </SplitHeadline>
              <StickerOrderForm />
            </div>
            <StickerRecentWork />
          </div>
        </section>
      </div>
    </>
  );
}