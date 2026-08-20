/*
 * The live catalog's size values are owner-typed free text, and the same size
 * is spelled several ways across 256 products: "X-Large", "X-large", "XL", and
 * "XL Tall" are all one filterable size; "Small" on the youth axis is not the
 * same size as "Small" on the apparel axis. Normalizing here — once, at the
 * mapper — is what lets the shop filter match on a small fixed vocabulary
 * instead of on whatever string the owner last typed into Wix.
 *
 * Unrecognized values return null: they stay visible on the product page (the
 * variant title is untouched), they just aren't filterable. Guessing would be
 * worse than not filtering.
 */

// Wix option keys that describe a size. Everything else on a product — Color,
// Brand, Embroidery, Number of Logos — is not a size axis and never reaches
// the filter. Compared after stripKey(), so spacing/punctuation drift is safe.
const SIZE_AXIS_KEYS = new Set(["size", "youthsize", "sizewomen", "womenssize"]);

export function isSizeAxis(optionKey: string): boolean {
  return SIZE_AXIS_KEYS.has(stripKey(optionKey));
}

function stripKey(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

function isYouthAxis(optionKey: string): boolean {
  return stripKey(optionKey) === "youthsize";
}

// Display order for each family, so a derived filter list reads like a size
// run rather than like the order Wix happened to return products in.
export const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
export const YOUTH_SIZE_ORDER = ["2T", "3T", "4T", "Y-XS", "Y-S", "Y-M", "Y-L", "Y-XL"];
export const HAT_SIZE_ORDER = [
  "One Size", "7", "7 1/8", "7 1/4", "7 3/8", "7 1/2", "7 5/8",
];

const ALPHA_SIZES: Record<string, string> = {
  "xs": "XS", "x small": "XS", "extra small": "XS",
  "s": "S", "small": "S",
  "m": "M", "medium": "M", "med": "M",
  "l": "L", "large": "L", "lg": "L",
  "xl": "XL", "x large": "XL", "extra large": "XL",
  "2xl": "2XL", "xxl": "2XL", "xx large": "2XL",
  "3xl": "3XL", "xxxl": "3XL", "xxx large": "3XL", "3x": "3XL",
  "4xl": "4XL", "xxxxl": "4XL", "4x": "4XL",
  "5xl": "5XL", "xxxxxl": "5XL", "5x": "5XL",
};

const YOUTH_FROM_ALPHA: Record<string, string> = {
  XS: "Y-XS", S: "Y-S", M: "Y-M", L: "Y-L", XL: "Y-XL",
};

/**
 * A raw Wix choice value plus the option key it came from → one canonical size
 * token, or null when the value isn't a size we can place.
 */
export function normalizeSize(raw: string, optionKey = "Size"): string | null {
  let value = raw.toLowerCase().replace(/[-–_]/g, " ").replace(/\s+/g, " ").trim();
  if (!value) return null;

  // "XL Tall", "2XL Long Tee", "Large Tall" are cut variations of a size the
  // shopper still thinks of as XL / 2XL / L.
  value = value.replace(/\s+(tall|long tee|long sleeve|big)$/, "").trim();

  // Youth is either its own axis or a prefix on the main one ("Youth- Small").
  let youth = isYouthAxis(optionKey);
  if (/^youth\b/.test(value)) {
    youth = true;
    value = value.replace(/^youth\b/, "").trim();
  }

  // Toddler sizing is already canonical and has no adult equivalent.
  const toddler = value.match(/^([234])\s?t$/);
  if (toddler) return `${toddler[1]}T`;

  // Fitted hat sizes: 7, 7 1/8 … 7 5/8.
  const fitted = value.match(/^7(?:\s+(\d)\s*\/\s*(\d))?$/);
  if (fitted) return fitted[1] ? `7 ${fitted[1]}/${fitted[2]}` : "7";

  // Adjustable/hat spans.
  if (/^s\s*\/\s*m$/.test(value)) return "S/M";
  if (/^l\s*\/\s*xl$/.test(value)) return "L/XL";
  // "Regular" is what this store calls a one-size snapback.
  if (value === "regular" || value === "one size" || value === "os" || value === "osfa") {
    return "One Size";
  }

  const alpha = ALPHA_SIZES[value];
  if (!alpha) return null;

  return youth ? YOUTH_FROM_ALPHA[alpha] ?? null : alpha;
}

export function isHatSize(token: string): boolean {
  return HAT_SIZE_ORDER.includes(token);
}

/** True only for genuine fitted-hat measurements (7, 7 1/8, …) — excludes
 *  "One Size", which is a hat size label but not a real size differentiator. */
export function isFittedHatSize(token: string): boolean {
  return token !== "One Size" && HAT_SIZE_ORDER.includes(token);
}

export function isYouthSize(token: string): boolean {
  return YOUTH_SIZE_ORDER.includes(token);
}

/** Sorts canonical tokens into their family's display order. */
export function sortSizes(tokens: string[]): string[] {
  const order = [...SIZE_ORDER, ...YOUTH_SIZE_ORDER, ...HAT_SIZE_ORDER];
  return [...tokens].sort((a, b) => order.indexOf(a) - order.indexOf(b));
}
