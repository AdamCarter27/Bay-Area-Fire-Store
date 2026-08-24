import { StickerHero } from "@/components/custom/StickerHero";
import { StickerOrderForm } from "@/components/custom/StickerOrderForm";
import { StickerRecentWork } from "@/components/custom/StickerRecentWork";
import { SplitHeadline } from "@/components/ui/SplitHeadline";

export default function CustomStickerPage() {
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