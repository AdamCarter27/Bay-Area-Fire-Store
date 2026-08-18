import { getWixProducts, getWixCollectionMap } from "@/lib/wix/get-prod";

export default async function WixTestPage() {
  const [products, collectionMap] = await Promise.all([
    getWixProducts(),
    getWixCollectionMap(),
  ]);

  return (
    <pre className="p-8 text-xs">
      {JSON.stringify({ collectionMap, sampleProducts: products.slice(0, 5) }, null, 2)}
    </pre>
  );
}