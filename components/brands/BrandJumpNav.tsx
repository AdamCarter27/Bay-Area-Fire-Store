"use client";

import type { BrandGroup } from "@/lib/data/brands";

export function BrandJumpNav({ groups }: { groups: BrandGroup[] }) {
  function scrollTo(slug: string) {
    document.getElementById(slug)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="overflow-x-auto py-3">
      <div className="flex w-max gap-2">
        {groups.map((group) => (
          <button
            key={group.slug}
            type="button"
            onClick={() => scrollTo(group.slug)}
            className="whitespace-nowrap rounded-full border border-line px-4 py-1.5 text-sm text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            {group.label}
          </button>
        ))}
      </div>
    </div>
  );
}