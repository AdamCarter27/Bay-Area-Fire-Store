"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { priceRanges } from "@/lib/data/priceRanges";

const sizeOptions = ["S", "M", "L", "XL", "2XL", "One size"];

export function ShopFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activePrices = searchParams.get("price")?.split(",").filter(Boolean) ?? [];
  const activeSizes = searchParams.get("size")?.split(",").filter(Boolean) ?? [];

  function toggleValue(key: "price" | "size", value: string, current: string[]) {
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
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wide text-ash">
          Shop by Price
        </h2>
        <div className="mt-4 flex flex-col gap-2.5 text-sm">
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
      </div>

      <div>
        <h2 className="text-sm font-medium uppercase tracking-wide text-ash">
          Size
        </h2>
        <div className="mt-4 flex flex-col gap-2.5 text-sm">
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
      </div>
    </div>
  );
}