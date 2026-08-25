/*
 * Shipping rules, mirrored from the owner's Wix shipping profile.
 *
 * Wix is the authority — it recalculates shipping at checkout and its number
 * is what the customer actually pays. These constants exist only so the cart
 * can show an honest figure *before* the shopper leaves the site, and so the
 * "free shipping" incentive can be surfaced while they're still adding items.
 *
 * Verified empirically against the live store (2026-08-24) by creating
 * checkouts at a range of subtotals:
 *
 *   $29.99 → $12.00     $119.96 → $12.00     $179.94 → free
 *   $59.98 → $12.00     $149.95 → $12.00     $299.90 → free
 *
 * If he changes his rates in Wix, change them here too — a mismatch means the
 * cart quotes one total and the checkout charges another, which is the fastest
 * way to lose a sale at the last step.
 */

export const SHIPPING_FLAT_RATE = 12;
export const FREE_SHIPPING_THRESHOLD = 150;

/** What Wix will charge for shipping on a given subtotal. */
export function shippingFor(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
}
