import { collabs } from "@/lib/data/collabs";
import { CollabsRollCall } from "@/components/collabs/CollabsRollCall";

export default function CollabsPage() {
  return (
    <div>
      <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
        <h1 className="font-display text-[clamp(1.8rem,4vw,2.6rem)] font-semibold tracking-tight text-ink">
          Check out and support our affiliates
        </h1>
        <p className="mt-4 max-w-2xl text-ash">
          The departments, crews, and causes we've partnered with.
        </p>
      </div>

      <CollabsRollCall collabs={collabs} />
    </div>
  );
}