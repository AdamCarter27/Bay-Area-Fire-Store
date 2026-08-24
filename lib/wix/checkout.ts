/*
 * Cart → Wix hosted checkout.
 *
 * We never take payment. The cart lives in localStorage on this site, and when
 * the shopper checks out we hand the line items to Wix, which owns payment,
 * tax, shipping rates, the order record, and the confirmation email. That's
 * what keeps this build free of a PCI surface and keeps the owner's existing
 * dashboard the single place orders appear.
 *
 * Two calls, in order:
 *   1. createCheckout  — turns line items into a Wix checkout, returns its id
 *   2. createRedirectSession — turns that id into a single-use URL to send the
 *      browser to, plus the URLs Wix uses to send the shopper back here
 *
 * Runs client-side. The Wix visitor token is minted from the public client ID
 * and already carries what both calls need — verified against the live store,
 * no extra permission grant required.
 */

import { createClient, OAuthStrategy } from "@wix/sdk";
import { checkout } from "@wix/ecom";
import { redirects } from "@wix/redirects";
import type { CartItem } from "@/components/cart/CartContext";
import { ONE_SIZE_VARIANT_ID } from "@/lib/wix/get-prod";

/*
 * The Wix Stores catalog app. Fixed value for every Wix Stores product — it
 * tells eCommerce which catalog to resolve `catalogItemId` against.
 */
const WIX_STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

/*
 * A dedicated client rather than the shared `wixClient` in lib/wix/client.ts:
 * that one is imported by server-rendered catalog pages, and pulling the ecom
 * and redirects modules into it would ship them to every page that reads
 * products.
 */
const checkoutClient = createClient({
  modules: { checkout, redirects },
  auth: OAuthStrategy({ clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID! }),
});

export class CheckoutError extends Error {}

function toLineItems(items: CartItem[]) {
  return items.map((item) => ({
    quantity: item.quantity,
    catalogReference: {
      appId: WIX_STORES_APP_ID,
      catalogItemId: item.wixId,
      /*
       * Only products whose variants Wix manages carry a real variant ID.
       * For the rest our catalog mapper invents a single "one size" variant so
       * the UI has something to select, and that synthetic ID is meaningless
       * to Wix — sending it fails the whole checkout with INVALID_ARGUMENT, so
       * those items go through with no options at all.
       */
      ...(item.variantId && item.variantId !== ONE_SIZE_VARIANT_ID
        ? { options: { variantId: item.variantId } }
        : {}),
    },
  }));
}

/**
 * Creates the Wix checkout and returns the URL to send the browser to.
 *
 * Throws rather than returning null on failure: the caller shows a redirect
 * spinner, and a silent failure would leave the shopper staring at a button
 * that appears to do nothing.
 */
export async function startWixCheckout(items: CartItem[]): Promise<string> {
  if (items.length === 0) {
    throw new CheckoutError("Your cart is empty.");
  }

  /*
   * An item with no wixId came from the mock fallback catalog, which only
   * renders when the live catalog read fails. It has no counterpart in Wix and
   * cannot be bought — better to say so than to send a reference Wix will
   * reject with a stack trace.
   */
  if (items.some((item) => !item.wixId)) {
    throw new CheckoutError(
      "Some items in your cart are unavailable right now. Please remove them and try again."
    );
  }

  const created = await checkoutClient.checkout.createCheckout({
    lineItems: toLineItems(items),
    channelType: checkout.ChannelType.WEB,
  });

  if (!created?._id) {
    throw new CheckoutError("Wix did not return a checkout to redirect to.");
  }

  const origin = window.location.origin;

  const session = await checkoutClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId: created._id },
    callbacks: {
      /*
       * Only this one means the purchase actually completed — Wix appends
       * ?orderId=… to it, and it's the only place the cart may be cleared.
       * postFlowUrl also fires when the shopper abandons or backs out, so
       * clearing there would silently empty a cart they still wanted.
       */
      thankYouPageUrl: `${origin}/checkout/complete`,
      postFlowUrl: `${origin}/cart`,
      cartPageUrl: `${origin}/cart`,
    },
  });

  const url = session?.redirectSession?.fullUrl;
  if (!url) {
    throw new CheckoutError("Wix did not return a checkout URL.");
  }

  return url;
}
