import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { CartProvider } from "@/components/cart/CartContext";
import { AddedToCartPopup } from "@/components/cart/AddedToCartPopUp";
import { socialLinks } from "@/lib/data/social";
import { SITE_URL } from "@/lib/site-url";
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

/*
 * Site-wide metadata defaults. Every page sets only its own `title` string and
 * inherits the rest — the template appends the store name so page titles never
 * have to repeat it, and openGraph/twitter fall through unless a page (a
 * product, say) overrides them with something better.
 *
 * `metadataBase` resolves relative OG image paths to absolute URLs, which
 * social scrapers require. The origin itself lives in lib/site-url.ts so the
 * sitemap and robots.txt resolve against the same one.
 */

const SITE_NAME = "Bay Area Fire Store";
const SITE_DESCRIPTION =
  "Firefighter-owned since 2024. Department apparel, custom embroidery and screen printing, and the brands the Bay Area fire service trusts.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Your Local Source for Bay Area Fire Gear`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: `${SITE_NAME} — Your Local Source for Bay Area Fire Gear`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Your Local Source for Bay Area Fire Gear`,
    description: SITE_DESCRIPTION,
  },
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
              {/* Same URLs the contact page uses — see lib/data/social.ts.
                  Text labels here rather than icons: the footer column reads as
                  a list of links, and an icon pair would sit oddly beside it. */}
              <div className="flex gap-4 text-sm">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ash transition-colors hover:text-ink"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="border-t border-line">
              <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-ash sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <p>© {new Date().getFullYear()} Bay Area Fire Store. All rights reserved.</p>
                <p>Firefighter-owned · Est. 2024</p>
              </div>
            </div>
          </footer>
          <AddedToCartPopup />
        </CartProvider>
      </body>
    </html>
  );
}