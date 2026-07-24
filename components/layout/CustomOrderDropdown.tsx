"use client";

import { useState } from "react";
import Link from "next/link";

const items = [
  { href: "/custom-order", label: "Custom Order Form" },
  { href: "/custom-order/brands", label: "Available Brands" },
];

export function CustomOrderDropdown({ light }: { light: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/custom-order"
        className={`transition-colors ${light ? "hover:text-paper" : "hover:text-ink"}`}
      >
        Custom Order Form
      </Link>

      {open && (
        <div className="absolute left-0 top-full z-[110] pt-3">
          <div className="w-56 rounded-lg border border-line bg-paper py-3 text-ink shadow-lg">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
