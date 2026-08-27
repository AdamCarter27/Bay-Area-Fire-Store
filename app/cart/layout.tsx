import type { Metadata } from "next";

/*
 * The cart page itself is a Client Component (it reads localStorage), and a
 * Client Component can't export `metadata` — so it lives here instead.
 */
export const metadata: Metadata = {
  title: "Your Cart",
  description: "Review the items in your cart before checking out.",
  // Nothing to index, and a crawler following a link into someone's cart is
  // only noise in search results.
  robots: { index: false, follow: true },
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
