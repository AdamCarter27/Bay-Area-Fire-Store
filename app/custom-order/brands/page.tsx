import type { Metadata } from "next";
import { SplitHeadline } from "@/components/ui/SplitHeadline";
import { garmentBrands, type GarmentBrand } from "@/lib/data/garmentBrands";

export const metadata: Metadata = {
  title: "Available Brands",
  description:
    "Garment and apparel brands we can customize with embroidery, screen printing, and heat press.",
};

// Group the (already alphabetical) brands by first letter for the columned list.
function groupByLetter(brands: GarmentBrand[]) {
  const groups: { letter: string; brands: GarmentBrand[] }[] = [];
  for (const brand of brands) {
    const first = brand.name[0].toUpperCase();
    const letter = /[A-Z]/.test(first) ? first : "#";
    const last = groups[groups.length - 1];
    if (last && last.letter === letter) last.brands.push(brand);
    else groups.push({ letter, brands: [brand] });
  }
  return groups;
}

export default function AvailableBrandsPage() {
  const groups = groupByLetter(garmentBrands);

  return (
    <section>
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <SplitHeadline
          as="h1"
          mode="play"
          className="text-center font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold tracking-tight text-ink"
        >
          Available Brands
        </SplitHeadline>
        <p className="mx-auto mt-4 max-w-2xl text-center text-ash">
          The garment and apparel brands we can customize
        </p>

        <div className="mt-14 gap-x-10 sm:columns-2 lg:columns-3">
          {groups.map((group) => (
            <div key={group.letter} className="mb-8 break-inside-avoid">
              <h2 className="mb-3 w-fit border-b border-line pb-1 font-display text-lg font-semibold text-ink">
                {group.letter}
              </h2>
              <ul className="flex flex-col gap-2">
                {group.brands.map((brand) => (
                  <li
                    key={brand.name}
                    className={`flex items-baseline gap-2.5 text-base ${
                      brand.available === false ? "text-ash" : "text-ink"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                        brand.available === false ? "bg-line-strong" : "bg-signal"
                      }`}
                    />
                    {brand.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
