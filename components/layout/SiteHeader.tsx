"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MobileMenu } from "./MobileMenu";
import { ShopDropdown } from "./ShopDropdown";
import { CustomOrderDropdown } from "./CustomOrderDropdown";
import { CartLink } from "@/components/cart/CartLink";

const navLinks = [
  { href: "/brands", label: "Brands" },
  { href: "/collabs", label: "Collabs" },
  { href: "/custom-order", label: "Custom Order Form" },
  // Custom Stickers link parked at the owner's request until the sticker page
  // launches — restore alongside the notFound() in its page.tsx and the
  // sitemap entry.
  // { href: "/custom-order/stickers", label: "Custom Stickers" },
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

  const light = true;

  return (
    <header
      className={`sticky top-0 z-[100] transition-colors duration-300 ${
        scrolled
          ? "border-b border-line-strong bg-ink/95 backdrop-blur-sm"
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
        <Link href="/" aria-label="Bay Area Fire Store — home" className="flex items-center">
          <Image
            src="/media/BayAreaFireStoreLogo.avif"
            unoptimized
            alt="Bay Area Fire Store"
            width={386}
            height={172}
            priority
            className={`h-10 w-auto transition-[filter] duration-300 sm:h-12 ${
              light ? "" : "invert"
            }`}
          />
        </Link>

        <nav
          aria-label="Primary"
          className={`hidden items-center gap-7 text-sm font-medium transition-colors md:flex ${
            light ? "text-paper/85" : "text-ink-soft"
          }`}
        >
          <ShopDropdown light={light} />
          {navLinks.map((link) =>
            link.href === "/custom-order" ? (
              <CustomOrderDropdown key={link.href} light={light} />
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  light ? "hover:text-paper" : "hover:text-ink"
                }`}
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <CartLink light={light} />
          <MobileMenu
            links={[
              { href: "/shop", label: "Shop" },
              ...navLinks,
              { href: "/custom-order/brands", label: "Available Brands" },
            ]}
            light={light}
          />
        </div>
      </div>
    </header>
  );
}