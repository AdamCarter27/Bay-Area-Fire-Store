"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";

type NavLink = { href: string; label: string };

export function MobileMenu({
  links,
  light = false,
}: {
  links: NavLink[];
  light?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
          light ? "text-paper hover:bg-paper/10" : "text-ink hover:bg-ink/[0.06]"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none">
          <path
            d="M3 6h14M3 10h14M3 14h14"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[300] flex flex-col bg-paper"
          >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span className="flex items-baseline gap-2 font-display text-lg font-semibold text-ink">
              <span aria-hidden className="h-2 w-2 rounded-full bg-signal" />
              Bay Area Fire Store
            </span>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-ink/[0.06]"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden fill="none">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <nav aria-label="Mobile" className="flex flex-col px-5 py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-4 font-display text-2xl text-ink transition-colors hover:text-signal"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3 px-5 py-6">
            <Button
              href="/custom-order"
              variant="primary"
              size="lg"
              onClick={() => setOpen(false)}
            >
              Start a custom order
            </Button>
            <Button
              href="/cart"
              variant="secondary"
              size="lg"
              onClick={() => setOpen(false)}
            >
              View cart
            </Button>
          </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
