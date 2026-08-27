import VerticalTextCarousel from "@/components/ui/VerticalTextCarousel";
import { ServiceCards } from "@/components/custom/ServiceCards";
import { CustomOrderForm } from "@/components/custom/CustomOrderForm";
import { RecentWork } from "@/components/custom/RecentWork";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom Orders",
  description:
    "Custom embroidery, screen printing, heat press, patches, and tumblers for Bay Area departments, stations, academies, and teams.",
};

export default function CustomOrderPage() {
  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <section className="py-14 sm:py-20">
          <VerticalTextCarousel />
        </section>
      </div>
      <ServiceCards />
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <section className="py-16 sm:py-24">
          <div className="grid gap-14 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3">
              <SplitHeadline
                as="h1"
                className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink"
              >
                Start Your Custom Order
              </SplitHeadline>
              <CustomOrderForm />
            </div>
            <RecentWork />
          </div>
        </section>
      </div>
    </>
  );
}
