import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/data/products";
import { categoryGroups } from "@/lib/data/categoryGroups";
import { brands, brandGroups } from "@/lib/data/brands";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { FilterDisclosure } from "@/components/shop/FilterDisclosure";
import { ShopSearch } from "@/components/shop/ShopSearch";
import { ProductCard } from "@/components/product/ProductCard";
import { priceRanges } from "@/lib/data/priceRanges";
import { isHatSize, isYouthSize, sortSizes } from "@/lib/wix/size-normalize";

/*
 * The live catalog is 256 products. Rendering all of them is a slow, unusable
 * wall on mobile, so the grid pages server-side through ?show= — filtering
 * always runs over the whole catalog, only the render is capped.
 */
const PAGE_SIZE = 60;

/*
 * Every word typed has to appear somewhere in the product's searchable text —
 */
function matchesQuery(haystack: string, terms: string[]) {
  return terms.every((term) => haystack.includes(term));
}

/*
 * Filter state lives in the query string, so a shared link like
 * ?brand=sffd deserves a title that says what it is. The canonical always
 * points at bare /shop, though: every filtered view is the same catalog in a
 * different order, and indexing them separately would be duplicate content.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; brand?: string; brandGroup?: string; q?: string }>;
}): Promise<Metadata> {
  const { group, brand, brandGroup, q } = await searchParams;

  const brandLabel = brands.find((b) => b.slug === brand)?.label;
  const groupLabel =
    categoryGroups.find((g) => g.slug === group)?.label ??
    brandGroups.find((g) => g.slug === brandGroup)?.label;

  const focus = brandLabel ?? groupLabel;
  const title = q
    ? `Search: ${q}`
    : focus
    ? `${focus}`
    : "Shop All Products";

  const description = focus
    ? `${focus} apparel and gear from the Bay Area Fire Store — firefighter-owned, shipped from the Bay Area.`
    : "Department apparel, headwear, hoodies, tees and accessories for the Bay Area fire service. Firefighter-owned since 2024.";

  return {
    title,
    description,
    alternates: { canonical: "/shop" },
    openGraph: { title, description, url: "/shop" },
    /*
     * Filtered and searched views are the same catalog resliced — let Google
     * index the canonical shop page and follow through to the products.
     *
     * Spread rather than `: undefined`, so the unfiltered case omits the key
     * entirely and inherits the root layout. An explicit `undefined` counts as
     * setting the field and wiped the layout's preview-build noindex.
     */
    ...(q || focus ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{
    group?: string;
    brandGroup?: string;
    brand?: string;
    price?: string;
    size?: string;
    hatSize?: string;
    youthSize?: string;
    q?: string;
    show?: string;
  }>;
}) {
  const {
    group: groupSlug,
    brandGroup: brandGroupSlug,
    brand: brandSlug,
    price: priceParam,
    size: sizeParam,
    hatSize: hatSizeParam,
    youthSize: youthSizeParam,
    q: queryParam,
    show: showParam,
  } = await searchParams;

  const activeGroup = categoryGroups.find((g) => g.slug === groupSlug);
  const activeBrandGroup = brandGroups.find((g) => g.slug === brandGroupSlug);
  const activeBrand = brands.find((b) => b.slug === brandSlug);
  const activePriceIds = priceParam?.split(",").filter(Boolean) ?? [];
  const activeSizes = sizeParam?.split(",").filter(Boolean) ?? [];
  const activeHatSizes = hatSizeParam?.split(",").filter(Boolean) ?? [];
  const activeYouthSizes = youthSizeParam?.split(",").filter(Boolean) ?? [];
  const query = queryParam?.trim() ?? "";
  // Hyphens become spaces on both sides of the comparison so "t-shirt" and
  // "t shirt" behave the same, and slugs like "sffd-hockey" stay searchable.
  const queryTerms = query
    .toLowerCase()
    .replace(/-/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  const allProducts = await getProducts();

  /*
   * Filter options come from the catalog itself rather than a hardcoded list,
   * split by size family so hat sizes never appear under apparel. Derived from
   * the unfiltered catalog on purpose: the options a shopper sees shouldn't
   * shift underneath them as they narrow things down.
   */
  const everySize = sortSizes([...new Set(allProducts.flatMap((p) => p.sizes))]);
  const sizeOptions = everySize.filter((s) => !isHatSize(s) && !isYouthSize(s));
  const hatSizeOptions = everySize.filter(isHatSize);
  const youthSizeOptions = everySize.filter(isYouthSize);

  let filtered = allProducts;

  if (queryTerms.length > 0) {
    filtered = filtered.filter((p) => {
      const brandLabels = p.collections
        .map((slug) => brands.find((b) => b.slug === slug)?.label ?? "")
        .join(" ");
      const haystack = `${p.title} ${p.categories.join(" ")} ${p.collections.join(" ")} ${brandLabels}`
        .toLowerCase()
        .replace(/-/g, " ");
      return matchesQuery(haystack, queryTerms);
    });
  }

  if (activeGroup) {
    filtered = filtered.filter((p) =>
      p.categories.some((c) => activeGroup.categories.includes(c))
    );
  }
  if (activeBrand) {
    filtered = filtered.filter((p) => p.collections.includes(activeBrand.slug));
  } else if (activeBrandGroup) {
    filtered = filtered.filter((p) =>
      p.collections.some((c) => activeBrandGroup.brands.includes(c))
    );
  }
  if (activePriceIds.length > 0) {
    const ranges = priceRanges.filter((r) => activePriceIds.includes(r.id));
    filtered = filtered.filter((p) =>
      ranges.some((r) => p.price >= r.min && p.price <= r.max)
    );
  }
  // Sizes match the product's normalized tokens, not its variant titles — a
  // live variant is titled "Black / X-large", which no filter value equals.
  const activeSizeTokens = [...activeSizes, ...activeHatSizes, ...activeYouthSizes];
  if (activeSizeTokens.length > 0) {
    filtered = filtered.filter((p) =>
      p.sizes.some((size) => activeSizeTokens.includes(size))
    );
  }

  // Buyable product leads; sold-out stays browsable at the end rather than
  // vanishing, since the owner restocks the same designs.
  filtered = [...filtered].sort(
    (a, b) => Number(b.inStock) - Number(a.inStock)
  );

  const shown = Math.max(PAGE_SIZE, Number(showParam) || 0);
  const visible = filtered.slice(0, shown);
  const hasMore = filtered.length > visible.length;

  // "Load more" keeps every active filter and only grows the page size.
  const loadMoreParams = new URLSearchParams();
  for (const [key, value] of Object.entries({
    group: groupSlug,
    brandGroup: brandGroupSlug,
    brand: brandSlug,
    price: priceParam,
    size: sizeParam,
    hatSize: hatSizeParam,
    youthSize: youthSizeParam,
    q: query || undefined,
  })) {
    if (value) loadMoreParams.set(key, value);
  }
  loadMoreParams.set("show", String(shown + PAGE_SIZE));
  const loadMoreHref = `/shop?${loadMoreParams.toString()}#shop-products`;

  const heading = activeBrand
    ? `Showing: ${activeBrand.label}`
    : activeBrandGroup
    ? `Showing: ${activeBrandGroup.label}`
    : activeGroup
    ? `Showing: ${activeGroup.label}`
    : "Browse our full collection.";

  // The sidebar links carry the search term forward so filtering and searching
  // compose — and so the search input never disagrees with the URL behind it.
  const withQuery = (href: string) =>
    query ? `${href}${href.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}` : href;

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      {/* Stacked on mobile; on wider screens the search sits alongside the
          heading rather than pushing the grid down. Top-aligned so the result
          count grows downward — bottom alignment would shove the input upward
          the moment the count appeared, mid-keystroke. */}
      <div className="sm:flex sm:items-start sm:gap-10">
        <div className="sm:shrink-0">
          <h1 className="font-display text-3xl font-semibold text-ink">Shop</h1>
          <p className="mt-2 text-ash">{heading}</p>
        </div>

        <div className="mt-6 max-w-md sm:mt-0 sm:w-full sm:flex-1">
          <ShopSearch initialQuery={query} />
          {query && (
            <p className="mt-2 text-sm text-ash" aria-live="polite">
              {filtered.length}{" "}
              {filtered.length === 1 ? "result" : "results"} for &ldquo;{query}
              &rdquo;
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-[200px_1fr]">
        <aside>
          <FilterDisclosure>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-ash">
              Shop
            </h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <Link
                href={withQuery("/shop")}
                className={
                  !activeGroup && !activeBrandGroup && !activeBrand
                    ? "font-medium text-ink underline"
                    : "text-ash hover:text-ink hover:underline"
                }
              >
                All Products
              </Link>
              {categoryGroups.map((group) => (
                <Link
                  key={group.slug}
                  href={withQuery(`/shop?group=${group.slug}`)}
                  className={
                    activeGroup?.slug === group.slug
                      ? "font-medium text-ink underline"
                      : "text-ash hover:text-ink hover:underline"
                  }
                >
                  {group.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-ash">
              Brands
            </h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              {brandGroups.map((group) => (
                <Link
                  key={group.slug}
                  href={withQuery(`/shop?brandGroup=${group.slug}`)}
                  className={
                    activeBrandGroup?.slug === group.slug
                      ? "font-medium text-ink underline"
                      : "text-ash hover:text-ink hover:underline"
                  }
                >
                  {group.label}
                </Link>
              ))}
              <Link href="/brands" className="text-ink underline">
                View all brands →
              </Link>
            </nav>
          </div>

          <div className="border-t border-line pt-8">
            <ShopFilters
              sizeOptions={sizeOptions}
              hatSizeOptions={hatSizeOptions}
              youthSizeOptions={youthSizeOptions}
            />
          </div>
          </FilterDisclosure>
        </aside>

        <div>
          <div
            id="shop-products"
            className="grid scroll-mt-24 grid-cols-2 gap-6 sm:grid-cols-3"
          >
            {visible.length === 0 && (
              // col-span-full so the message reads as a sentence across the grid
              // rather than wrapping inside a single product column.
              <p className="col-span-full text-sm text-ash">
                {query
                  ? `Nothing matches “${query}” with these filters.`
                  : "No products match these filters."}
              </p>
            )}
            {visible.map((product, i) => (
              <ProductCard
                key={product.slug}
                product={product}
                // The first row is above the fold on every breakpoint.
                priority={i < 3}
              />
            ))}
          </div>

          {hasMore && (
            <div className="mt-12 flex flex-col items-center gap-2">
              <p className="text-sm text-ash">
                Showing {visible.length} of {filtered.length}
              </p>
              {/* A link, not a button: the page stays server-rendered and the
                  wider view is shareable. */}
              <Link
                href={loadMoreHref}
                scroll={false}
                className="rounded-full border border-line-strong px-6 py-2.5 text-sm font-medium text-ink transition-colors hover:border-ink"
              >
                Load more
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
