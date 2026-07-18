"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/custom-order", label: "Custom Order Form" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Adaptive header: transparent with light text while over the video hero,
 * transitions to solid paper with dark text once the content scrolls up.
 */
export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = !scrolled;

  return (
    <header
      className={`sticky top-0 z-[100] transition-colors duration-300 ${
        scrolled
          ? "border-b border-line bg-paper/85 backdrop-blur-sm"
          : "border-b border-transparent"
      }`}
    >
      {/* Faint top scrim so nav stays legible over bright footage. */}
      {light && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-ink/45 to-transparent"
        />
      )}

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-5 py-4 sm:px-8">
        <Link
          href="/"
          className={`flex items-baseline gap-2 font-display text-lg font-semibold tracking-tight transition-colors ${
            light ? "text-paper" : "text-ink"
          }`}
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 shrink-0 translate-y-[-1px] rounded-full bg-signal"
          />
          Bay Area Fire Store
        </Link>

        <nav
          aria-label="Primary"
          className={`hidden items-center gap-7 text-sm font-medium transition-colors md:flex ${
            light ? "text-paper/85" : "text-ink-soft"
          }`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors ${
                light ? "hover:text-paper" : "hover:text-ink"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <Link
            href="/cart"
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              light
                ? "border-paper/40 text-paper hover:border-paper"
                : "border-line-strong text-ink hover:border-ink"
            }`}
          >
            Cart
          </Link>
          <MobileMenu links={navLinks} light={light} />
        </div>
      </div>
    </header>
  );
}
