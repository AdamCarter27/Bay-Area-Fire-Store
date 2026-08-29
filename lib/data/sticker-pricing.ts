// Sticker pricing — placeholder numbers, update freely as the owner finalizes
// real pricing. Each tier is "at least this many stickers costs this total."
// Standard size only (up to 3"); anything larger falls back to a manual quote
// since sizing changes cost too much to price automatically.

export const STANDARD_SIZE_LABEL = 'Up to 3"';

export const QUANTITY_TIERS = [
  { quantity: 25, price: 50 },
  { quantity: 50, price: 75 },
  { quantity: 100, price: 120 },
  { quantity: 250, price: 225 },
  { quantity: 500, price: 375 },
  { quantity: 1000, price: 600 },
  { quantity: 2500, price: 1250 },
] as const;

export const MINIMUM_ORDER_QUANTITY = QUANTITY_TIERS[0].quantity;

export function getStandardPrice(quantity: number): number | null {
  const tier = QUANTITY_TIERS.find((t) => t.quantity === quantity);
  return tier ? tier.price : null;
}

export function getPricePerSticker(quantity: number): number | null {
  const price = getStandardPrice(quantity);
  return price ? Number((price / quantity).toFixed(2)) : null;
}