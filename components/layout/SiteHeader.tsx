"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { ShopDropdown } from "./ShopDropdown";
import { CartLink } from "@/components/cart/CartLink";

const navLinks = [
  { href: "/brands", label: "Brands" },
  { href: "/custom-order", label: "Custom Order Form" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

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
          <ShopDropdown light={light} />
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
          <CartLink light={light} />
          <MobileMenu links={[{ href: "/shop", label: "Shop" }, ...navLinks]} light={light} />
        </div>
      </div>
    </header>
  );
}