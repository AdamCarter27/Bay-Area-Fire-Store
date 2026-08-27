import type { Metadata } from "next";
import { OrderComplete } from "@/components/cart/OrderComplete";

export const metadata: Metadata = {
  title: "Order confirmed",
  // Nothing to index, and a crawler landing on someone's confirmation is only
  // noise in search results.
  robots: { index: false, follow: false },
};

/*
 * Where Wix sends the shopper after a completed purchase — the `thankYouPageUrl`
 * of the redirect session in lib/wix/checkout.ts. Wix appends ?orderId=… to it.
 *
 * Reaching this page is the only signal we get that a purchase actually went
 * through, so it is also the only place the local cart may be emptied.
 */
export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  return <OrderComplete orderId={orderId} />;
}
