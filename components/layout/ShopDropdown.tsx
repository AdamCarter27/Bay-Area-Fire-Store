"use client";

import { useState } from "react";
import Link from "next/link";
import { categoryGroups } from "@/lib/data/categoryGroups";
import { brandGroups } from "@/lib/data/brands";

export function ShopDropdown({ light }: { light: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/shop"
        className={`transition-colors ${light ? "hover:text-paper" : "hover:text-ink"}`}
      >
        Shop
      </Link>

      {open && (
        <div className="absolute left-0 top-full z-[110] pt-3">
          <div className="flex w-[480px] rounded-lg border border-line bg-paper text-ink shadow-lg">
            <div className="flex-1 border-r border-line py-3">
              <p className="px-4 pb-2 text-xs font-medium uppercase tracking-wide text-ash">
                Shop
              </p>
              <Link
                href="/shop"
                className="block px-4 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                All Products
              </Link>
              {categoryGroups.map((group) => (
                <Link
                  key={group.slug}
                  href={`/shop?group=${group.slug}`}
                  className="block px-4 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                >
                  {group.label}
                </Link>
              ))}
            </div>

            <div className="flex-1 py-3">
              <p className="px-4 pb-2 text-xs font-medium uppercase tracking-wide text-ash">
                Brands
              </p>
              {brandGroups.map((group) => (
                <Link
                  key={group.slug}
                  href={`/shop?brandGroup=${group.slug}`}
                  className="block px-4 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
                >
                  {group.label}
                </Link>
              ))}
              <Link
                href="/brands"
                className="mt-1 block border-t border-line px-4 pt-2 text-sm font-medium text-ink transition-colors hover:underline"
              >
                View all brands →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}