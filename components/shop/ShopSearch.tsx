"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";

/*
 * Search lives in the URL like every other shop filter, so a result set stays
 * shareable and composes with the category/brand/price filters instead of
 * replacing them.
 *
 * The input owns its own value while you type and pushes to the URL on a
 * debounce — typing straight into the router would make every keystroke wait
 * on a server render. The sidebar links carry `q` forward (see app/shop/page),
 * so nothing outside this component changes the query behind its back.
 */
const DEBOUNCE_MS = 250;

export function ShopSearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(initialQuery);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  function navigate(query: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = query.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");

    const search = params.toString();
    // replace(), not push() — typing shouldn't bury the previous page under a
    // history entry per keystroke. scroll:false keeps the grid where it is.
    router.replace(search ? `${pathname}?${search}` : pathname, {
      scroll: false,
    });
  }

  function handleChange(next: string) {
    setValue(next);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => navigate(next), DEBOUNCE_MS);
  }

  function handleSubmit(event: React.FormEvent) {
    // Enter shouldn't wait out the debounce.
    event.preventDefault();
    if (timeout.current) clearTimeout(timeout.current);
    navigate(value);
  }

  function handleClear() {
    setValue("");
    if (timeout.current) clearTimeout(timeout.current);
    navigate("");
  }

  return (
    <form role="search" onSubmit={handleSubmit} className="relative">
      <label htmlFor="shop-search" className="sr-only">
        Search products
      </label>
      <FiSearch
        aria-hidden
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash"
      />
      <input
        id="shop-search"
        type="search"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Search products"
        autoComplete="off"
        // appearance-none: iOS Safari lays out type="search" with its own
        // internal metrics and ignores the left padding, stacking the icon on
        // top of the placeholder. Killing the native searchfield look fixes it.
        className="w-full appearance-none rounded-md border border-line-strong bg-paper py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-ash transition-colors hover:border-ash [-webkit-appearance:none] [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-ash transition-colors hover:bg-surface hover:text-ink"
        >
          <FiX aria-hidden className="h-4 w-4" />
        </button>
      )}
    </form>
  );
}
