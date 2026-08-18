import { createClient, OAuthStrategy } from "@wix/sdk";
import { products, collections } from "@wix/stores";

export const wixClient = createClient({
  modules: { products, collections },
  auth: OAuthStrategy({
    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
  }),
});

// Wix caps a query page at 100 items and `find()` returns only the first page,
// so every catalog read has to walk `hasNext()` to the end. Skipping this
// silently truncates the store rather than erroring.
const PAGE_SIZE = 100;

/**
 * Wix collection ID → collection name, for every collection on the store.
 * Products reference collections by ID only, so the mapper needs this to
 * resolve names before matching them against collection-mapping.ts.
 */
export async function getWixCollectionMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  let page = await wixClient.collections.queryCollections().limit(PAGE_SIZE).find();

  while (true) {
    for (const c of page.items) {
      if (c._id && c.name) map[c._id] = c.name;
    }
    if (!page.hasNext()) break;
    page = await page.next();
  }

  return map;
}
