import { brands, brandGroups } from "@/lib/data/brands";
import { BrandCard } from "@/components/brands/BrandCard";
import { Reveal } from "@/components/ui/Reveal";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { BrandJumpNav } from "@/components/brands/BrandJumpNav";
import { ScrollFadeHeading } from "@/components/brands/ScrollFadeHeading";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Departments & Brands",
  description:
    "Shop by department, station, club, or cause — SFFD, Richmond, Colma, Palo Alto, and the Bay Area crews we print and embroider for.",
};

export default function BrandsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
      <section className="pb-8 pt-14 sm:pb-10 sm:pt-20">
        <SplitHeadline
          as="h1"
          className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink"
        >
          Brands
        </SplitHeadline>
        <p className="mt-4 max-w-2xl text-ash">
          Shop by department, club, or collection — every patch we carry,
          in one place.
        </p>
      </section>

      <BrandJumpNav groups={brandGroups} />

      <div className="flex flex-col gap-16 pb-20 pt-12 sm:gap-20 sm:pb-28 sm:pt-16">
        {brandGroups.map((group) => {
          const groupBrands = group.brands
            .map((slug) => brands.find((b) => b.slug === slug))
            .filter((b): b is NonNullable<typeof b> => Boolean(b));

          return (
            <section key={group.slug} id={group.slug} className="scroll-mt-28">
              <ScrollFadeHeading className="font-display text-xl font-semibold tracking-tight text-ink">
                {group.label}
              </ScrollFadeHeading>
              <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-4">
                {groupBrands.map((brand, i) => (
                  <Reveal
                    key={brand.slug}
                    delay={(i % 4) * 70}
                    className={`min-w-0 ${
                      i === 0 ? "col-span-2 row-span-2 sm:col-span-2" : ""
                    }`}
                  >
                    <BrandCard brand={brand} featured={i === 0} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}