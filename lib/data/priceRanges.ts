// Shop price-filter buckets. Lives in lib/data so the server-side shop page can import the real array —
export type PriceRange = {
  id: string;
  label: string;
  min: number;
  max: number;
};

export const priceRanges: PriceRange[] = [
  { id: "0-25", label: "$0 – $25", min: 0, max: 25 },
  { id: "25-50", label: "$25 – $50", min: 25, max: 50 },
  { id: "50-100", label: "$50 – $100", min: 50, max: 100 },
];
