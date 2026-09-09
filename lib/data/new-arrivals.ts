/*
 * What counts as a new arrival.
 *
 * Wix has a hand-curated "New Arrivals" collection, but curation is upkeep the
 * owner has to remember: it went four months without an update while genuinely
 * new stock piled up outside it, so the shop tab led with months-old product
 * and the "New" badge sat on things that no longer were. Recency is derivable
 * from the catalog, so both derive it from here instead.
 *
 * A count rather than a date window. A quiet couple of months would empty a
 * date-based rule entirely, and an empty New Arrivals tab reads as a broken
 * site rather than as a slow month.
 */
export const NEW_ARRIVALS_COUNT = 24;

/**
 * The slugs of the most recently created products, newest first.
 *
 * Products with no createdAt — the mock fallback catalog — sort last and can
 * still fill the set if the catalog is thin, which keeps an offline render
 * from showing an empty tab.
 */
export function newestSlugs(
  products: { slug: string; createdAt?: string }[],
  count: number = NEW_ARRIVALS_COUNT
): Set<string> {
  return new Set(
    [...products]
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
      .slice(0, count)
      .map((product) => product.slug)
  );
}
