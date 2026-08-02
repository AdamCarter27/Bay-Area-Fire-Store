"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { priceRanges } from "@/lib/data/priceRanges";

const sizeOptions = ["S", "M", "L", "XL", "2XL"];
const hatSizeOptions = ["One Size", "S/M", "L/XL", "7", "7 1/8", "7 1/4", "7 3/8", "7 1/2", "7 5/8"];

function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line pb-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-sm font-medium uppercase tracking-wide text-ash"
      >
        {title}
        <span className="text-base leading-none text-ink">{open ? "–" : "+"}</span>
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activePrices = searchParams.get("price")?.split(",").filter(Boolean) ?? [];
  const activeSizes = searchParams.get("size")?.split(",").filter(Boolean) ?? [];
  const activeHatSizes = searchParams.get("hatSize")?.split(",").filter(Boolean) ?? [];

  function toggleValue(key: "price" | "size" | "hatSize", value: string, current: string[]) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length > 0) {
      params.set(key, next.join(","));
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <FilterSection title="Shop by Price">
        <div className="flex flex-col gap-2.5 text-sm">
          {priceRanges.map((range) => (
            <label key={range.id} className="flex items-center gap-2.5 text-ink-soft">
              <input
                type="checkbox"
                checked={activePrices.includes(range.id)}
                onChange={() => toggleValue("price", range.id, activePrices)}
                className="h-4 w-4 rounded border-line accent-ink"
              />
              {range.label}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Size">
        <div className="flex flex-col gap-2.5 text-sm">
          {sizeOptions.map((size) => (
            <label key={size} className="flex items-center gap-2.5 text-ink-soft">
              <input
                type="checkbox"
                checked={activeSizes.includes(size)}
                onChange={() => toggleValue("size", size, activeSizes)}
                className="h-4 w-4 rounded border-line accent-ink"
              />
              {size}
            </label>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Hat Size" defaultOpen={false}>
        <div className="flex flex-col gap-2.5 text-sm">
          {hatSizeOptions.map((size) => (
            <label key={size} className="flex items-center gap-2.5 text-ink-soft">
              <input
                type="checkbox"
                checked={activeHatSizes.includes(size)}
                onChange={() => toggleValue("hatSize", size, activeHatSizes)}
                className="h-4 w-4 rounded border-line accent-ink"
              />
              {size}
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}