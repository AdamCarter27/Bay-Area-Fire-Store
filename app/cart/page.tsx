import { getProducts } from "@/lib/data/products";
import { buildCartStock } from "@/lib/data/cart-stock";
import { CartView } from "@/components/cart/CartView";

/*
 * The cart itself is client state (localStorage), but whether its items are
 * still buyable is not — that has to come from the catalog. This page reads it
 * server-side and hands the client view a stock snapshot.
 *
 * force-dynamic because a prerendered stock map would be frozen at build time,
 * which is exactly the staleness this is meant to fix. The read is cheap: it
 * shares the cached catalog every other page uses, so a warm request costs no
 * network trip.
 */
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const products = await getProducts();
  return <CartView stock={buildCartStock(products)} />;
}
