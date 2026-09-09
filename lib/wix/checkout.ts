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

/*
 * `options` carries both halves of what eCommerce needs to resolve the item:
 * which variant, and the answers to the product's custom text fields keyed by
 * their exact Wix title. Omitting a mandatory text field does not fail the
 * call — Wix returns 200 and silently drops the line — so startWixCheckout
 * checks the response rather than trusting it.
 */
function toCatalogOptions(item: CartItem) {
  const options: Record<string, unknown> = {};

  if (item.variantId && item.variantId !== ONE_SIZE_VARIANT_ID) {
    options.variantId = item.variantId;
  }
  if (item.customText && Object.keys(item.customText).length > 0) {
    options.customTextFields = item.customText;
  }

  return Object.keys(options).length > 0 ? { options } : {};
}

function toLineItems(items: CartItem[]) {
  return items
    .filter((item) => !item.isCustom)
    .map((item) => ({
      quantity: item.quantity,
      catalogReference: {
        appId: WIX_STORES_APP_ID,
        catalogItemId: item.wixId,
        ...toCatalogOptions(item),
      },
    }));
}

/*
 * KNOWN BLOCKER — custom line items do not work with the auth this site uses.
 *
 * Wix rejects them with:
 *   "This action requires the following permission scope:
 *    Manage eCommerce - Admin Permissions (SCOPE.ECOM.MANAGE...)"
 *
 * We authenticate with OAuthStrategy on the public client ID, which mints a
 * *visitor* token — deliberately, since it is what keeps this build free of
 * server-side secrets and of a PCI surface. Admin scope is not available to it
 * at any SDK version, so this is a design constraint, not a bug to patch.
 *
 * Verified 2026-08-31: catalog checkout (lineItems) succeeds and redirects;
 * any cart containing a custom item fails on createCheckout.
 *
 * Currently unreachable — the sticker page 404s (app/custom-order/stickers)
 * and addCustomItem() is only called from the form it renders, so no customer
 * can create one. Before unparking stickers, this needs a real decision:
 * either route custom orders through the existing Wix form (as /custom-order
 * already does) or create real catalog products for sticker configurations so
 * they go through `lineItems` instead.
 */
function toCustomLineItems(items: CartItem[]) {
  return items
    .filter((item) => item.isCustom)
    .map((item) => ({
      quantity: item.quantity,
      price: item.price.toFixed(2),
      productName: { original: item.title },
      // `as const` so the literal is not widened to `string` inside map() —
      // Wix types this as an ItemTypePreset enum member, not any string.
      itemType: { preset: "PHYSICAL" as const },
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
  if (items.some((item) => !item.isCustom && !item.wixId)) {
    throw new CheckoutError(
      "Some items in your cart are unavailable right now. Please remove them and try again."
    );
  }

  const lineItems = toLineItems(items);

  const created = await checkoutClient.checkout.createCheckout({
    lineItems,
    customLineItems: toCustomLineItems(items),
    channelType: checkout.ChannelType.WEB,
  });

  if (!created?._id) {
    throw new CheckoutError("Wix did not return a checkout to redirect to.");
  }

  /*
   * Wix accepts a line item it cannot resolve and then leaves it out of the
   * checkout, still answering 200 — a product with a mandatory custom text
   * field is dropped this way when the field is missing. Without this check
   * the shopper is redirected to a Wix page that tells them their cart is
   * empty, which is how this shipped broken for the embroidery products.
   */
  const accepted = (created.lineItems ?? []).filter(
    (line) => line.catalogReference
  );

  if (accepted.length < lineItems.length) {
    throw new CheckoutError(
      "Some items in your cart couldn't be sent to checkout. Please remove " +
        "them and re-add them from the product page, or contact us and we'll " +
        "place the order for you."
    );
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
