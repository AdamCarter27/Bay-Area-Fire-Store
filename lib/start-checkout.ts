// Checkout submission — THE second Wix Headless swap-in point (the first is
// lib/submit-custom-order.ts).
//
// Today this is a stub so the demo has a complete, believable buy flow with no
// backend, no payment processor, and no PCI surface. Nothing is charged and no
// order is stored.
//
// When the site goes live on Wix Headless, only this file changes:
//
//   1. Create a client: createClient({ modules: { checkout, currentCart },
//      auth: OAuthStrategy({ clientId }) }) from @wix/sdk + @wix/ecom.
//   2. Map `payload.items` to Wix line items — catalogReference.catalogItemId
//      is the Wix product ID and .options carries the variant, so CartItem
//      needs to start carrying the Wix product/variant IDs when the catalog
//      swap lands (see lib/data/products.ts).
//   3. checkout.createCheckout({ lineItems, channelType: WEB }), then
//      redirect the browser to the returned checkoutUrl.
//
// Wix's hosted checkout then owns payment, tax, shipping rates, order
// confirmation email, and the order record — so the contact/shipping fields
// collected here become a pre-fill (checkout.buyerInfo / shippingInfo) rather
// than something this app stores. The cart, the summary UI, and the order
// review step stay exactly as they are.

import type { CartItem } from "@/components/cart/CartContext";

export type CheckoutContact = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes?: string;
};

export type CheckoutPayload = {
  contact: CheckoutContact;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
};

export type CheckoutResult = {
  // Stand-in for the Wix order number. Real orders get theirs from Wix.
  orderNumber: string;
};

// Flat-rate placeholder. Real rates come from the Wix shipping profile at
// checkout — this exists so the summary shows a plausible total in the demo.
export const SHIPPING_FLAT_RATE = 8;

// Placeholder rate for the demo total. Real tax is calculated by Wix against
// the shipping address at checkout — never hardcode it once that lands.
const DEMO_TAX_RATE = 0.0925;

export function calculateTotals(items: CartItem[]) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = SHIPPING_FLAT_RATE

  const tax = Math.round(subtotal * DEMO_TAX_RATE * 100) / 100;

  return { subtotal, shipping, tax, total: subtotal + shipping + tax };
}

export async function startCheckout(
  _payload: CheckoutPayload
): Promise<CheckoutResult> {
  // Fake latency so the "Placing order…" state is visible in the demo.
  await new Promise((resolve) => setTimeout(resolve, 1100));

  const suffix = String(Math.floor(Math.random() * 90000) + 10000);
  return { orderNumber: `BAFS-${suffix}` };
}
