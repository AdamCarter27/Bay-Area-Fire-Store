import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bay Area Fire Store",
  description: "Your local source for Bay Area fire gear and apparel.",
};

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/custom-order", label: "Custom Order Form" },
  { href: "/shop", label: "Shop" },
  { href: "/brands", label: "Brands" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-black">
        <header className="border-b border-black/[.08] dark:border-white/[.145]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Bay Area Fire Store
            </Link>
            <nav className="hidden gap-6 text-sm font-medium md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
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
        </header>

        <main className="flex flex-1 flex-col">{children}</main>

        <footer className="border-t border-black/[.08] dark:border-white/[.145]">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <nav className="flex flex-wrap gap-6 text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/faq" className="hover:text-black dark:hover:text-white">
                FAQ
              </Link>
              <Link
                href="/shipping-returns"
                className="hover:text-black dark:hover:text-white"
              >
                Shipping &amp; Returns
              </Link>
              <Link href="/terms" className="hover:text-black dark:hover:text-white">
                Terms &amp; Conditions
              </Link>
            </nav>
            <form className="flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                placeholder="Stay updated, never miss a drop"
                className="w-56 rounded-full border border-black/[.08] bg-transparent px-4 py-2 text-sm dark:border-white/[.145]"
              />
              <button
                type="submit"
                className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
              >
                Sign Up
              </button>
            </form>
          </div>
        </footer>
      </body>
    </html>
  );
}
