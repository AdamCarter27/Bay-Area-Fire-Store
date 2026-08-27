import { getWixProducts } from "@/lib/wix/get-prod";
import { getWixCollectionMap } from "@/lib/wix/client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catalog Debug",
  description:
    "Internal catalog diagnostics.",
  // Internal debug route — must not be indexed, and should be deleted before
  // launch rather than merely hidden.
  robots: { index: false, follow: false },
};

/*
 * Dev-only diagnostic for the Wix catalog integration. Not linked from the
 * site. Reports how much of the live store actually survives the mapping in
 * lib/wix/get-prod.ts, so the gaps are visible as numbers rather than as
 * products quietly missing from a filter.
 *
 * The gap counts are a store-data problem, not a code one: a product with no
 * category is one the owner never filed under a garment collection in Wix.
 * These numbers should fall toward zero as those collections get tidied.
 */
export default async function WixTestPage() {
  const [products, collectionMap] = await Promise.all([
    getWixProducts(),
    getWixCollectionMap(),
  ]);

  const noCategory = products.filter((p) => p.categories.length === 0);
  const noBrand = products.filter((p) => p.collections.length === 0);
  const neither = products.filter(
    (p) => p.categories.length === 0 && p.collections.length === 0
  );

  return (
    <div className="space-y-8 p-8 font-mono text-xs">
      <section>
        <h1 className="text-sm font-bold">Wix catalog</h1>
        <p className="mt-2">
          products: {products.length} &nbsp; collections:{" "}
          {Object.keys(collectionMap).length}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold">Mapping gaps</h2>
        <p className="mt-2">
          no category: {noCategory.length} &nbsp; no brand: {noBrand.length}{" "}
          &nbsp; neither: {neither.length}
        </p>
      </section>

      <section>
        <h2 className="text-sm font-bold">
          Uncategorized ({noCategory.length})
        </h2>
        <ul className="mt-2 space-y-1">
          {noCategory.map((p) => (
            <li key={p.wixId}>- {p.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-bold">No brand ({noBrand.length})</h2>
        <ul className="mt-2 space-y-1">
          {noBrand.map((p) => (
            <li key={p.wixId}>- {p.title}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-bold">Sample mapped products</h2>
        <pre className="mt-2">{JSON.stringify(products.slice(0, 5), null, 2)}</pre>
      </section>

      <section>
        <h2 className="text-sm font-bold">Collection map</h2>
        <pre className="mt-2">{JSON.stringify(collectionMap, null, 2)}</pre>
      </section>
    </div>
  );
}
