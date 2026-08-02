import Link from "next/link";
import { products } from "@/lib/data/products";
import { categoryGroups } from "@/lib/data/categoryGroups";
import { brands, brandGroups } from "@/lib/data/brands";
import { ShopFilters, priceRanges } from "@/components/shop/ShopFilters";

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
  }>;
}) {
  const {
    group: groupSlug,
    brandGroup: brandGroupSlug,
    brand: brandSlug,
    price: priceParam,
    size: sizeParam,
    hatSize: hatSizeParam,
  } = await searchParams;

  const activeGroup = categoryGroups.find((g) => g.slug === groupSlug);
  const activeBrandGroup = brandGroups.find((g) => g.slug === brandGroupSlug);
  const activeBrand = brands.find((b) => b.slug === brandSlug);
  const activePriceIds = priceParam?.split(",").filter(Boolean) ?? [];
  const activeSizes = sizeParam?.split(",").filter(Boolean) ?? [];
  const activeHatSizes = hatSizeParam?.split(",").filter(Boolean) ?? [];

  let filtered = products;

  if (activeGroup) {
    filtered = filtered.filter((p) => activeGroup.categories.includes(p.category));
  }
  if (activeBrand) {
    filtered = filtered.filter((p) => p.collection === activeBrand.slug);
  } else if (activeBrandGroup) {
    filtered = filtered.filter(
      (p) => p.collection && activeBrandGroup.brands.includes(p.collection)
    );
  }
  if (activePriceIds.length > 0) {
    const ranges = priceRanges.filter((r) => activePriceIds.includes(r.id));
    filtered = filtered.filter((p) =>
      ranges.some((r) => p.price >= r.min && p.price <= r.max)
    );
  }
  if (activeSizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => activeSizes.includes(v.title))
    );
  }
  if (activeHatSizes.length > 0) {
    filtered = filtered.filter((p) =>
      p.variants.some((v) => activeHatSizes.includes(v.title))
    );
  }

  const heading = activeBrand
    ? `Showing: ${activeBrand.label}`
    : activeBrandGroup
    ? `Showing: ${activeBrandGroup.label}`
    : activeGroup
    ? `Showing: ${activeGroup.label}`
    : "Browse our full collection.";

  return (
    <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Shop</h1>
      <p className="mt-2 text-ash">{heading}</p>

      <div className="mt-8 grid grid-cols-1 gap-10 sm:grid-cols-[200px_1fr]">
        <aside className="flex flex-col gap-8">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-ash">
              Shop
            </h2>
            <nav className="mt-4 flex flex-col gap-2 text-sm">
              <Link
                href="/shop"
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
                  href={`/shop?group=${group.slug}`}
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
                  href={`/shop?brandGroup=${group.slug}`}
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
            <ShopFilters />
          </div>
        </aside>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          {filtered.length === 0 && (
            <p className="text-sm text-ash">No products match these filters.</p>
          )}
          {filtered.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className="group rounded-xl border border-line p-4 transition-colors hover:border-line-strong"
            >
              <div className="relative flex aspect-square items-center justify-center rounded-lg bg-surface text-sm text-ash">
                Product photo
                {product.badge && (
                  <span className="absolute left-2 top-2 rounded-full bg-ink px-2 py-1 text-xs text-paper">
                    {product.badge}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs capitalize text-ash">{product.category}</p>
              <h3 className="mt-1 font-medium text-ink group-hover:underline">
                {product.title}
              </h3>
              <p className="mt-1 text-sm text-ash">${product.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}