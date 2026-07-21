import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CartProvider } from "@/components/cart/CartContext";
import "./globals.css";

// Display: a refined variable serif for the editorial headlines.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["opsz"],
});

// Body/UI: a clean neutral sans on the opposite side of the contrast axis.
const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bay Area Fire Store — Your Local Source for Bay Area Fire Gear",
  description:
    "Firefighter-owned since 2024. Your trusted source for high-quality on- and off-duty apparel, custom embroidery and screen printing, and the brands you trust.",
};

const footerNav = [
  { href: "/faq", label: "FAQ" },
  { href: "/shipping-returns", label: "Shipping & Returns" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <CartProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-paper"
          >
            Skip to content
          </a>

          <SiteHeader />

          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>

          <footer className="mt-auto border-t border-line bg-surface">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.5fr_1fr_1.5fr]">
              <div className="max-w-xs">
                <p className="flex items-baseline gap-2 font-display text-lg font-semibold text-ink">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full bg-signal"
                  />
                  Bay Area Fire Store
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ash">
                  A firefighter-owned business, established 2024. Your local source
                  for high-quality on- and off-duty Bay Area fire gear.
                </p>
              </div>

              <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
                {footerNav.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="w-fit text-ash transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex gap-4 text-sm">
                <a
                  href="https://www.facebook.com/profile.php?id=61568764863734"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/bayareafirestore/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-500 hover:text-black dark:hover:text-white"
                >
                  Instagram
                </a>
              </div>
            </div>

            <div className="border-t border-line">
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-ash sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p>© {new Date().getFullYear()} Bay Area Fire Store. All rights reserved.</p>
                <p>Firefighter-owned · Est. 2024</p>
              </div>
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}