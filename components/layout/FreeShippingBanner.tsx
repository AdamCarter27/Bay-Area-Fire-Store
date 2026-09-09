"use client";

import { useState } from "react";

export function FreeShippingBanner() {
  console.log("FreeShippingBanner rendered");

  const [visible, setVisible] = useState(true);

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center bg-signal py-2 px-8 text-center text-xs font-medium tracking-wide text-paper sm:text-sm">
      <span>Free shipping on orders over $150</span>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-paper/80 hover:text-paper"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 6l12 12M18 6L6 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
