"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

/*
 * Collapses the shop's category/brand/filter panel behind a toggle on mobile
 * so it doesn't bury the product grid, while staying an always-open sidebar
 * on desktop. The panel content is server-rendered and passed as children —
 * only the open/close toggle is interactive.
 */
export function FilterDisclosure({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const scrollToResults = useRef(false);

  /*
   * On mobile, picking a filter should get you to the results, not leave you
   * scrolling past the panel you just used. Delegated so the panel's contents
   * can stay server-rendered links/checkboxes. Desktop keeps the sidebar put.
   */
  function handlePanelClick(event: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(min-width: 640px)").matches) return;

    const target = event.target as HTMLElement;
    if (!target.closest("a[href], label, input[type='checkbox']")) return;

    scrollToResults.current = true;
    setOpen(false);
  }

  // Scroll only once the panel has actually collapsed — measuring while it's
  // still expanded overshoots the grid by the panel's height.
  useEffect(() => {
    if (open || !scrollToResults.current) return;
    scrollToResults.current = false;
    document
      .getElementById("shop-products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [open]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="shop-filter-panel"
        className="flex w-full items-center justify-between rounded-lg border border-line-strong px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-ink sm:hidden"
      >
        Filter &amp; browse
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          aria-hidden
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <div
        id="shop-filter-panel"
        onClick={handlePanelClick}
        className={`flex-col gap-8 ${open ? "mt-6 flex" : "hidden"} sm:mt-0 sm:flex`}
      >
        {children}
      </div>
    </div>
  );
}
