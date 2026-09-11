import Image from "next/image";
import type { Collab } from "@/lib/data/collabs";

export function CollabsRollCall({ collabs }: { collabs: Collab[] }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col divide-y divide-line px-5 sm:px-8">
      {collabs.map((collab, i) => (
        <div
          key={collab.slug}
          className={`flex flex-col gap-6 py-10 sm:items-center ${
            i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"
          }`}
        >
          <div className="relative h-56 w-full shrink-0 overflow-hidden rounded-xl sm:w-72">
            <Image
              src={collab.image}
              alt={collab.name}
              fill
              sizes="(min-width: 640px) 288px, 100vw"
              className="object-contain p-6"
            />
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold text-ink">
              {collab.name}
            </h3>
            <p className="mt-2 text-sm text-ash">{collab.description}</p>
            <a
              href={collab.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-medium text-signal hover:underline"
            >
              Visit their page
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}