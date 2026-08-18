import { createClient, OAuthStrategy } from "@wix/sdk";
import { products, collections } from "@wix/stores";

export const wixClient = createClient({
  modules: { products, collections },
  auth: OAuthStrategy({
    clientId: process.env.NEXT_PUBLIC_WIX_CLIENT_ID!,
  }),
});

export async function getWixCollectionMap(): Promise<Record<string, string>> {
  const { items } = await wixClient.collections.queryCollections().find();
  const map: Record<string, string> = {};
  for (const c of items) {
    if (c._id && c.name) map[c._id] = c.name;
  }
  return map;
}